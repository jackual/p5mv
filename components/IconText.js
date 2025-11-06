import React from 'react';

export default function IconText({
  as: Component = 'div',
  icon: Icon,
  iconProps = {},
  children,
  className = '',
  ...props
}) {
  return (
    <Component
      className={`icon-text ${className}`}
      {...props}
    >
      {Icon && <Icon className="icon-text__icon" {...iconProps} />}
      <span className="icon-text__content">{children}</span>
    </Component>
  );
}