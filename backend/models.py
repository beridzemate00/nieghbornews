"""Database models for NeighborNews application."""
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication and post authoring."""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    posts = db.relationship('NewsPost', backref='author', lazy='dynamic')
    
    def set_password(self, password):
        """Hash and set the user's password."""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if the provided password matches the hash."""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Serialize user to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }


class NewsPost(db.Model):
    """News post model for local neighborhood news."""
    __tablename__ = 'news_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # Outdoors, Transport, Events, Danger, Announcements
    district = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, verified, rejected
    image_url = db.Column(db.String(255), nullable=True)
    view_count = db.Column(db.Integer, default=0)
    
    # Category constants
    CATEGORIES = ['Outdoors', 'Transport', 'Events', 'Danger', 'Announcements']
    
    # Status constants
    STATUSES = ['pending', 'verified', 'rejected']
    
    def to_dict(self, include_author=True):
        """Serialize news post to dictionary."""
        data = {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'category': self.category,
            'district': self.district,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'status': self.status,
            'image_url': self.image_url,
            'view_count': self.view_count
        }
        if include_author and self.author:
            data['author'] = {
                'id': self.author.id,
                'name': self.author.name
            }
        return data
