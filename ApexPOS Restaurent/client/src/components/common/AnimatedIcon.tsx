import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, LucideProps } from 'lucide-react';

interface AnimatedIconProps extends LucideProps {
    icon: LucideIcon;
    animation?: 'hover-rotate' | 'hover-scale' | 'pulse' | 'bounce' | 'spin' | 'none';
    active?: boolean;
    className?: string;
    size?: number;
}

const AnimatedIcon = ({
    icon: Icon,
    animation = 'hover-scale',
    active = false,
    className = '',
    size = 20,
    ...props
}: AnimatedIconProps) => {

    const variants = {
        'hover-rotate': {
            hover: { rotate: 15, scale: 1.1 },
            active: { rotate: 0, scale: 1.1 }
        },
        'hover-scale': {
            hover: { scale: 1.2 },
            active: { scale: 1.15 }
        },
        'pulse': {
            animate: {
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
            },
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        'bounce': {
            hover: { y: -3 },
            active: { y: -2 }
        },
        'spin': {
            animate: { rotate: 360 },
            transition: {
                duration: 8,
                repeat: Infinity,
                ease: "linear"
            }
        },
        'none': {}
    };

    const currentVariant = variants[animation] || {};

    return (
        <motion.div
            whileHover={animation.startsWith('hover') || animation === 'bounce' ? 'hover' : undefined}
            animate={active ? 'active' : (animation === 'pulse' || animation === 'spin' ? 'animate' : undefined)}
            variants={currentVariant}
            transition={animation === 'pulse' || animation === 'spin' ? (currentVariant as any).transition : { type: "spring", stiffness: 400, damping: 10 }}
            className={`flex items-center justify-center ${className}`}
        >
            <Icon size={size} {...props} />
        </motion.div>
    );
};

export default AnimatedIcon;
