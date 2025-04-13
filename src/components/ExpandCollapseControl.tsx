import React, { useState } from 'react';
import './ExpandCollapseControl.scss'
const ExpandCollapseControl = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpandCollapse = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div onClick={toggleExpandCollapse} className='expand-collapse-heading' >
        {title} {isExpanded ? '-' : '+'}
      </div>
      {isExpanded && <div className=''><h2> {children}</h2></div>}
    </div>
  );
};

export default ExpandCollapseControl;