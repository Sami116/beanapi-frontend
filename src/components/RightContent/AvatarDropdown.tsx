import {LogoutOutlined, UserOutlined} from '@ant-design/icons';
import {useEmotionCss} from '@ant-design/use-emotion-css';
import {history, useModel} from '@umijs/max';
import {Spin} from 'antd';
import {stringify} from 'querystring';
import type {MenuInfo} from 'rc-menu/lib/interface';
import React, {useCallback} from 'react';
import {flushSync} from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';
import {userLogoutUsingPOST} from "@/services/beanapi-backend/userController";
import {ItemType} from "antd/es/menu/hooks/useItems";


export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const {initialState} = useModel('@@initialState');
  const {loginUser} = initialState || {};
  return <span className="anticon">{loginUser?.userName}</span>;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({children}) => {


  const {initialState, setInitialState} = useModel('@@initialState');

  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    await userLogoutUsingPOST();
    const {search, pathname} = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  };
  const actionClassName = useEmotionCss(({token}) => {
    return {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });


  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const {key} = event;
      if (key === 'logout') {
        flushSync(() => {
          setInitialState((s) => ({...s, loginUser: undefined}));
        });
        loginOut();
        return;
      }
      if (key === 'info') {
        history.push('/user/info');
        return;
      }
      // history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const loading = (
    <span className={actionClassName}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const {loginUser} = initialState;

  if (!loginUser || !loginUser.userName) {
    return loading;
  }

  const menuItems: ItemType[] = [
    {
      key: 'info',
      icon: <UserOutlined/>,
      label: '个人中心',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined/>,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};

