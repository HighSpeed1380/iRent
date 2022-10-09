/**
 * Rct Collapsible Card
 */
import React, { useState } from 'react';
import { Collapse, Badge } from 'reactstrap';
import classnames from 'classnames';

// rct section loader
import RctSectionLoader from '../RctSectionLoader/RctSectionLoader';

function RctCollapsibleCard(props) {
   const [reload,setReload] = useState(false);
   const [collapse,setCollapse] = useState(true);
   const [close, setClose] = useState(false);

	const onReload = (e) => {
      e.preventDefault();
      setReload(true);
		setTimeout(() => {
         setReload(false);
		}, 1500);
	}

   const { children, collapsible, closeable, reloadable, heading, fullBlock, colClasses, customClasses, headingCustomClasses, contentCustomClasses, badge } = props;
   return (
      <div className={classnames(colClasses ? colClasses : '', { 'd-block': !collapse })}>
         <div className={classnames(`rct-block ${customClasses ? customClasses : ''}`, { 'd-none': close })}>
            {heading &&
               <div className={`rct-block-title ${headingCustomClasses ? headingCustomClasses : ''}`}>
                  <h4>{heading} {badge && <Badge className="p-1 ml-10" color={badge.class}>{badge.name}</Badge>}</h4>
                  {(collapsible || reloadable || closeable) &&
                     <div className="contextual-link">
                  {collapsible && <a href="!#" onClick={(e) => {e.preventDefault();setCollapse(!collapse)}}><i className="ti-minus"></i></a>}
                        {reloadable && <a href="!#" onClick={(e) => onReload(e)}><i className="ti-reload"></i></a>}
                  {closeable && <a href="!#" onClick={(e) => {e.preventDefault(); setClose(true)}}><i className="ti-close"></i></a>}
                     </div>
                  }
               </div>
            }
            <Collapse isOpen={collapse}>
               <div className={classnames(contentCustomClasses ? contentCustomClasses : '', { "rct-block-content": !fullBlock, 'rct-full-block': fullBlock })}>
                  {children}
               </div>
            </Collapse>
            {reload && <RctSectionLoader />}
         </div>
      </div>
   );
}

export default RctCollapsibleCard;
