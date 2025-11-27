import React from 'react';

export default function IconText({
  as: Component = 'div',
  icon: Icon,
  iconProps = {},
  children,
  className = '',
  spin,
  ...props
}) {
  return (
    <Component
      className={`icon-text ${className}`}
      {...props}
    >
      {Icon && <Icon className={`icon-text__icon ${spin ? 'spinning' : ''}`} {...iconProps} />}
      <span className="icon-text__content">{children}</span>
    </Component>
  );
}