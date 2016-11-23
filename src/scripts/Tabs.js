import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import { registerStyle } from './util';
import DropdownButton from './DropdownButton';

/**
 *
 */
const TabMenu = (props) => {
  const { icon, children, ...pprops } = props;
  return (
    <DropdownButton
      className='react-slds-tab-menu'
      icon={ icon }
      type='icon-bare'
      iconSize='small'
      nubbinTop
      { ...pprops }
    >
      { children }
    </DropdownButton>
  );
};

TabMenu.propTypes = {
  icon: PropTypes.string,
  children: PropTypes.node,
};

/**
 *
 */
const TabItem = (props) => {
  const {
    type, activeKey, title, eventKey, menu, activeTabRef, menuIcon,
    onTabClick, onTabKeyDown,
  } = props;
  let { menuItems } = props;
  menuItems = menu ? menu.props.children : menuItems;
  const menuProps = menu ? menu.props : {};
  const isActive = eventKey === activeKey;
  const tabItemClassName = classnames(
    'slds-tabs__item',
    `slds-tabs--${type}__item`,
    'slds-text-heading---label',
    { 'slds-active': isActive },
    { 'react-slds-tab-with-menu': menu || menuItems }
  );
  const tabLinkClassName = `slds-tabs--${type}__link`;
  return (
    <li className={ tabItemClassName } role='presentation'>
      <span className='react-slds-tab-item-inner'>
        <a
          className={ tabLinkClassName }
          role='tab'
          ref={ isActive ? activeTabRef : undefined }
          tabIndex={ isActive ? 0 : -1 }
          aria-selected={ isActive }
          onClick={ () => onTabClick(eventKey) }
          onKeyDown={ e => onTabKeyDown(eventKey, e) }
        >
          { title }
        </a>
        {
          menuItems ?
            <TabMenu icon={ menuIcon } { ...menuProps }>{ menuItems }</TabMenu> :
            undefined
        }
      </span>
    </li>
  );
};

TabItem.propTypes = {
  type: PropTypes.string,
  activeKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  activeTabRef: PropTypes.func,
  title: PropTypes.string,
  menu: PropTypes.element,
  menuItems: PropTypes.arrayOf(PropTypes.element),
  menuIcon: PropTypes.string,
  eventKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onTabClick: PropTypes.func,
  onTabKeyDown: PropTypes.func,
};

/**
 *
 */
const TabNav = (props) => {
  const {
    type = 'default', activeKey, activeTabRef, tabs,
    onTabClick, onTabKeyDown,
  } = props;
  const tabNavClassName = `slds-tabs--${type}__nav`;
  return (
    <ul className={ tabNavClassName } role='tablist'>
      {
        React.Children.map(tabs, tab => (
          <TabItem
            { ...tab.props }
            type={ type } activeKey={ activeKey } activeTabRef={ activeTabRef }
            onTabClick={ onTabClick }
            onTabKeyDown={ onTabKeyDown }
          />
        ))
      }
    </ul>
  );
};

TabNav.propTypes = {
  type: PropTypes.string,
  activeKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  activeTabRef: PropTypes.func,
  tabs: PropTypes.node,
  onTabClick: PropTypes.func,
  onTabKeyDown: PropTypes.func,
};

/**
 *
 */
export default class Tabs extends Component {

  constructor() {
    super();
    this.state = {};
    registerStyle('tab-menu', [
      [
        '.slds-tabs__item.react-slds-tab-with-menu',
        '{ position: relative !important; overflow: visible !important; }',
      ],
      [
        '.slds-tabs__item.react-slds-tab-with-menu > .react-slds-tab-item-inner',
        '{ overflow: hidden }',
      ],
      [
        '.slds-tabs__item.react-slds-tab-with-menu > .react-slds-tab-item-inner > a',
        '{ padding-right: 2rem; }',
      ],
      [
        '.react-slds-tab-menu',
        '{ position: absolute; top: 0; right: 0; visibility: hidden }',
      ],
      [
        '.react-slds-tab-menu button',
        '{ height: 2.5rem; line-height: 2rem; width: 2rem; }',
      ],
      [
        '.slds-tabs__item.slds-active .react-slds-tab-menu',
        '.slds-tabs__item:hover .react-slds-tab-menu',
        '{ visibility: visible }',
      ],
    ]);
  }

  componentDidUpdate() {
    if (this.state.focusTab) {
      const el = this.activeTab;
      if (el) {
        el.focus();
      }
      /* eslint-disable react/no-did-update-set-state */
      this.setState({ focusTab: false });
    }
  }

  onTabClick = (tabKey) => {
    if (this.props.onSelect) {
      this.props.onSelect(tabKey);
    }
    // Uncontrolled
    this.setState({ activeKey: tabKey, focusTab: true });
  }

  onTabKeyDown = (tabKey, e) => {
    if (e.keyCode === 37 || e.keyCode === 39) { // left/right cursor key
      let idx = 0;
      const tabKeys = [];
      React.Children.forEach(this.props.children, (tab, i) => {
        tabKeys.push(tab.props.eventKey);
        if (tabKey === tab.props.eventKey) {
          idx = i;
        }
      });
      const dir = e.keyCode === 37 ? -1 : 1;
      const activeIdx = (idx + dir + tabKeys.length) % tabKeys.length;
      const activeKey = tabKeys[activeIdx];
      this.onTabClick(activeKey);
      e.preventDefault();
      e.stopPropagation();
    }
  }

  render() {
    const { className, children } = this.props;
    const type = this.props.type === 'scoped' ? 'scoped' : 'default';
    const tabsClassNames = classnames(className, `slds-tabs--${type}`);
    const activeKey =
      typeof this.props.activeKey !== 'undefined' ? this.props.activeKey :
      typeof this.state.activeKey !== 'undefined' ? this.state.activeKey :
      this.props.defaultActiveKey;
    return (
      <div className={ tabsClassNames }>
        <TabNav
          type={ type }
          activeKey={ activeKey }
          activeTabRef={ (node) => { this.activeTab = node; } }
          tabs={ children }
          onTabClick={ this.onTabClick }
          onTabKeyDown={ this.onTabKeyDown }
        />
        {
          React.Children.map(children, (tab) => {
            const { eventKey } = tab.props;
            const active = eventKey === activeKey;
            return React.cloneElement(tab, { active });
          })
        }
      </div>
    );
  }
}

const TAB_TYPES = ['default', 'scoped'];

Tabs.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf(TAB_TYPES),
  onSelect: PropTypes.func,
  children: PropTypes.node,
  defaultActiveKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  activeKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};
