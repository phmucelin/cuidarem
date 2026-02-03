import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, User, FileText } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Início' },
        { path: '/registros', icon: ClipboardList, label: 'Registros' },
        { path: '/relatorio', icon: FileText, label: 'Relatório' },
        { path: '/perfil', icon: User, label: 'Perfil' },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `bottom-nav-item ${isActive ? 'active' : ''} ${item.isAction ? 'action-item' : ''}`
                    }
                >
                    <span className={`nav-icon ${item.isAction ? 'action-icon' : ''}`}>
                        <item.icon size={item.isAction ? 32 : 24} />
                    </span>
                    <span className="nav-label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
