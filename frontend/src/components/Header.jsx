/**
 * Header Component - Navigation bar with responsive menu
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark-custom fixed-top">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    📰 NeighborNews
                </Link>

                <button
                    className="navbar-toggler border-0"
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                        </li>
                        {user && (
                            <li className="nav-item">
                                <Link
                                    className={`nav-link ${isActive('/add') ? 'active' : ''}`}
                                    to="/add"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Post News
                                </Link>
                            </li>
                        )}
                        {isAdmin && (
                            <li className="nav-item">
                                <Link
                                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                                    to="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Admin Panel
                                </Link>
                            </li>
                        )}
                    </ul>

                    <div className="d-flex align-items-center gap-3">
                        {user ? (
                            <div className="dropdown">
                                <button
                                    className="btn btn-outline-light dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const dropdown = e.target.nextElementSibling;
                                        dropdown.classList.toggle('show');
                                    }}
                                >
                                    👤 {user.name}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
                                    <li>
                                        <span className="dropdown-item-text text-muted small">
                                            {user.email}
                                        </span>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                logout();
                                                setIsMenuOpen(false);
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link
                                className="btn btn-primary"
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Header;
