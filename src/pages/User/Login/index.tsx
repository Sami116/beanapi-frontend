import {LockOutlined, MobileOutlined, UserOutlined} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import {history, useModel} from '@umijs/max';
import {Alert, message, Tabs} from 'antd';
import React, {useState} from 'react';
import {
  sendCodeUsingGET, userLoginByEmailUsingPOST,
  userLoginUsingPOST,
} from '@/services/beanapi-backend/userController';
import {Link} from '@@/exports';
import {useEmotionCss} from "@ant-design/use-emotion-css";

const LoginMessage: React.FC<{
  content: string;
}> = ({content}) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};
const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const {initialState, setInitialState} = useModel('@@initialState');
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {
      let res;
      if (type === 'account') {
        // 登录
        res = await userLoginUsingPOST({
          ...values,
        });
      } else {
        res = await userLoginByEmailUsingPOST({
          ...values,
        });
      }
      console.log(res);
      if (res.data) {
        await setInitialState((s) => ({...s, loginUser: res.data}));
        const urlParams = new URL(window.location.href).searchParams;
        await setUserLoginState(res.data);
        setTimeout(() => {
          history.push(urlParams.get('redirect') || '/');
        },100)
        return;
      }
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
  const {status, type: loginType} = userLoginState;
  return (
    <div className={containerClassName}>
      <div>
        <LoginForm
          // logo={<img alt="logo" src="/logo.svg" />}
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          title="Bean API"
          subTitle={
            <>
              <p>
                <b>API开放调用平台</b>
              </p>
            </>
          }
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.UserLoginRequest);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录',
              },
              {
                key: 'email',
                label: 'QQ邮箱登录',
              },
            ]}
          />

          {status === 'error' && loginType === 'account' && (
            <LoginMessage content={'错误的用户名和密码'}/>
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined/>,
                }}
                placeholder={'账号'}
                rules={[
                  {
                    required: true,
                    message: '账号是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined/>,
                }}
                placeholder={'密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
            </>
          )}

          {status === 'error' && loginType === 'email' && <LoginMessage content="验证码错误"/>}
          {type === 'email' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined/>,
                }}
                name="emailNum"
                placeholder={'请输入QQ邮箱！'}
                rules={[
                  {
                    required: true,
                    message: '邮箱是必填项！',
                  },
                  {
                    // pattern: /^1\d{10}$/,    手机号码正则表达式
                    pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                    message: '不合法的邮箱！',
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  autoComplete: "new-password",
                  size: 'large',
                  prefix: <LockOutlined/>,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'请输入验证码！'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'秒后重新获取'}`;
                  }
                  return '获取验证码';
                }}
                name="emailCaptcha"
                phoneName="emailNum"
                rules={[
                  {
                    required: true,
                    message: '验证码是必填项！',
                  },
                ]}
                onGetCaptcha={async (emailNum) => {
                  const captchaType: string = 'login';
                  const result = await sendCodeUsingGET({
                    emailNum,
                    captchaType,
                  });
                  if (result === false) {
                    return;
                  }
                  message.success(result.data);
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <Link
              style={{
                float: 'right',
              }}
              to={'/user/register'}
            >
              没有账号？去注册
            </Link>
          </div>
        </LoginForm>
      </div>
      {/*<Footer />*/}
    </div>
  );
};
export default Login;
