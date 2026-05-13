import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useStore } from '../store/useStore';

const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useStore();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-all duration-200 text-text"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
                <Moon className="w-5 h-5 text-gray-700" />
            )}
        </button>
    );
};

export default ThemeToggle;
