import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiHome, HiChevronRight } from 'react-icons/hi';

/**
 * Breadcrumb Navigation Component
 * Provides navigation path for better UX
 */
const Breadcrumb = ({ items = [] }) => {
    const location = useLocation();
    
    // Auto-generate breadcrumbs from path if items not provided
    const generateBreadcrumbs = () => {
        if (items.length > 0) return items;
        
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Home', path: '/' }];
        
        let currentPath = '';
        paths.forEach((path, index) => {
            currentPath += `/${path}`;
            const label = path
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            breadcrumbs.push({ label, path: currentPath });
        });
        
        return breadcrumbs;
    };
    
    const breadcrumbs = generateBreadcrumbs();
    
    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 py-3 px-4 md:px-8 bg-gray-50 border-b border-gray-200">
            <Link to="/" className="hover:text-primary-500 transition-colors">
                <HiHome className="w-4 h-4" />
            </Link>
            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                    <HiChevronRight className="w-4 h-4 text-gray-400" />
                    {index === breadcrumbs.length - 1 ? (
                        <span className="text-gray-900 font-medium">{crumb.label}</span>
                    ) : (
                        <Link
                            to={crumb.path}
                            className="hover:text-primary-500 transition-colors"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;

