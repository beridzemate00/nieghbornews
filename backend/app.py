"""NeighborNews - Flask Backend Application."""
import os
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import config
from models import db, User, NewsPost

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(config['development'])

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize database
db.init_app(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


# ================================
# AUTH DECORATORS
# ================================

def token_required(f):
    """Decorator to require valid JWT token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated


def admin_required(f):
    """Decorator to require admin role."""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated


def generate_token(user):
    """Generate JWT token for a user."""
    payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }
    return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')


# ================================
# AUTH ROUTES
# ================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['name', 'email', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        name=data['name'],
        email=data['email'],
        role='user'
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    token = generate_token(user)
    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'user': user.to_dict()
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login and get JWT token."""
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    token = generate_token(user)
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    })


@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current user info."""
    return jsonify({'user': current_user.to_dict()})


# ================================
# NEWS ROUTES
# ================================

@app.route('/api/news', methods=['GET'])
def get_news():
    """Get news posts with optional filters."""
    query = NewsPost.query
    
    # Filter by district
    district = request.args.get('district')
    if district:
        query = query.filter(NewsPost.district == district)
    
    # Filter by category
    category = request.args.get('category')
    if category:
        query = query.filter(NewsPost.category == category)
    
    # Filter by status (default to verified for public)
    status = request.args.get('status', 'verified')
    if status:
        query = query.filter(NewsPost.status == status)
    
    # Order by newest first
    query = query.order_by(NewsPost.created_at.desc())
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'news': [post.to_dict() for post in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@app.route('/api/news/<int:id>', methods=['GET'])
def get_single_news(id):
    """Get a single news post by ID."""
    post = NewsPost.query.get_or_404(id)
    
    # Increment view count
    post.view_count += 1
    db.session.commit()
    
    return jsonify({'news': post.to_dict()})


@app.route('/api/news', methods=['POST'])
@token_required
def create_news(current_user):
    """Create a new news post."""
    data = request.form.to_dict() if request.form else request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['title', 'content', 'category', 'district']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    if data['category'] not in NewsPost.CATEGORIES:
        return jsonify({'error': f'Invalid category. Must be one of: {NewsPost.CATEGORIES}'}), 400
    
    # Handle image upload
    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename:
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_url = f'/static/uploads/{filename}'
    
    post = NewsPost(
        title=data['title'],
        content=data['content'],
        category=data['category'],
        district=data['district'],
        author_id=current_user.id,
        image_url=image_url,
        status='pending'
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify({
        'message': 'News post created successfully',
        'news': post.to_dict()
    }), 201


@app.route('/api/news/<int:id>', methods=['PUT'])
@token_required
def update_news(current_user, id):
    """Update a news post."""
    post = NewsPost.query.get_or_404(id)
    
    # Check if user is author or admin
    if post.author_id != current_user.id and current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        post.title = data['title']
    if 'content' in data:
        post.content = data['content']
    if 'category' in data:
        if data['category'] not in NewsPost.CATEGORIES:
            return jsonify({'error': f'Invalid category'}), 400
        post.category = data['category']
    if 'district' in data:
        post.district = data['district']
    
    db.session.commit()
    
    return jsonify({
        'message': 'News post updated',
        'news': post.to_dict()
    })


@app.route('/api/news/<int:id>', methods=['DELETE'])
@token_required
def delete_news(current_user, id):
    """Delete a news post."""
    post = NewsPost.query.get_or_404(id)
    
    # Check if user is author or admin
    if post.author_id != current_user.id and current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({'message': 'News post deleted'})


# ================================
# ADMIN ROUTES
# ================================

@app.route('/api/admin/pending', methods=['GET'])
@admin_required
def get_pending_posts(current_user):
    """Get all pending posts for admin review."""
    posts = NewsPost.query.filter_by(status='pending').order_by(NewsPost.created_at.desc()).all()
    return jsonify({'news': [post.to_dict() for post in posts]})


@app.route('/api/admin/verify/<int:id>', methods=['POST'])
@admin_required
def verify_post(current_user, id):
    """Verify a pending post."""
    post = NewsPost.query.get_or_404(id)
    post.status = 'verified'
    db.session.commit()
    return jsonify({'message': 'Post verified', 'news': post.to_dict()})


@app.route('/api/admin/reject/<int:id>', methods=['POST'])
@admin_required
def reject_post(current_user, id):
    """Reject a pending post."""
    post = NewsPost.query.get_or_404(id)
    post.status = 'rejected'
    db.session.commit()
    return jsonify({'message': 'Post rejected', 'news': post.to_dict()})


@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_stats(current_user):
    """Get dashboard statistics."""
    total_posts = NewsPost.query.count()
    pending_posts = NewsPost.query.filter_by(status='pending').count()
    verified_posts = NewsPost.query.filter_by(status='verified').count()
    rejected_posts = NewsPost.query.filter_by(status='rejected').count()
    total_users = User.query.count()
    
    return jsonify({
        'stats': {
            'total_posts': total_posts,
            'pending_posts': pending_posts,
            'verified_posts': verified_posts,
            'rejected_posts': rejected_posts,
            'total_users': total_users
        }
    })


# ================================
# DISTRICTS ENDPOINT
# ================================

@app.route('/api/districts', methods=['GET'])
def get_districts():
    """Get all unique districts."""
    districts = db.session.query(NewsPost.district).distinct().all()
    return jsonify({'districts': [d[0] for d in districts]})


@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all categories."""
    return jsonify({'categories': NewsPost.CATEGORIES})


# ================================
# DATABASE INITIALIZATION
# ================================

def init_db():
    """Initialize database and create admin user if not exists."""
    with app.app_context():
        db.create_all()
        
        # Create admin user if not exists
        admin = User.query.filter_by(email='admin@neighbornews.local').first()
        if not admin:
            admin = User(
                name='Admin',
                email='admin@neighbornews.local',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('Admin user created: admin@neighbornews.local / admin123')
        
        print('Database initialized successfully!')


# ================================
# MAIN
# ================================

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
