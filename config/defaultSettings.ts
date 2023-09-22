import {ProLayoutProps} from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {

  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#1677FF',
  layout: 'top',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Bean API',
  pwa: false,
}
export default Settings;

