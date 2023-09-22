import {
  getInterfaceInfoByIdUsingGET,
  invokeInterfaceInfoUsingPOST,
} from '@/services/beanapi-backend/interfaceInfoController';
import {PageContainer} from '@ant-design/pro-components';

import {Button, Card, Descriptions, Divider, Form, Input, message} from 'antd';
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router';
import {getFreeInterfaceCountUsingPOST} from "@/services/beanapi-backend/userInterfaceInfoController";
import {useModel} from "@umijs/max";


/**
 * 接口文档
 * @constructor
 */
const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [invokeLoading, setInvokeLoading] = useState(false);
  const [data, setData] = useState<API.InterfaceInfoVO>();
  const [invokeRes, setInvokeRes] = useState<any>();
  const params = useParams();
  const [totalAmount, setTotalAmount] = useState(1.0);
  const [orderCount, setOrderCount] = useState(1);
  const [orderModalOpen, setAddOrderModalOpen] = useState(false);
  const {initialState, setInitialState} = useModel('@@initialState');
  const {loginUser} = initialState;

  const loadData = async () => {
    if (!params.id) {
      message.error('参数不存在');
    }
    setLoading(true);
    try {
      const res = await getInterfaceInfoByIdUsingGET({
        id: Number(params.id),
      });
      setData(res.data);
    } catch (error: any) {
      message.error('请求失败, ' + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onFinish = async (values: any) => {
    if (!params.id) {
      message.error('接口不存在');
      return;
    }

    try {
      setInvokeLoading(true);
      const res = await invokeInterfaceInfoUsingPOST({
        id: params.id,
        ...values,
      });
      if (res.code === 0) {
        setInvokeRes(res.data);
        message.success('请求成功');
      }
    } catch (error: any) {
      message.error('请求失败，' + error.message);
    }
    setInvokeLoading(false);
    loadData();
    return;
  };

  const showAddOrderModal = () => {
    setTotalAmount(parseFloat((orderCount * parseFloat(data?.charging)).toFixed(2)));
    setAddOrderModalOpen(true);
  };

  const getFreeInterface = async () => {
    setInvokeLoading(true);
    try {
      const res = await getFreeInterfaceCountUsingPOST({
        userId: loginUser.id,
        interfaceId: data?.id,
        lockNum: 100,
      });
      if (res.data) {
        message.success('获取调用次数成功');
      } else {
        message.error('获取失败请重试');
      }
    } catch (e: any) {
      message.error('请求失败，' + e.message);
    }
    setInvokeLoading(false);
    loadData();
    return
  };

  return (
    <PageContainer title="查看接口文档">
      <Card>
        {data ? (
          <Descriptions title={data.name} column={1} extra={
            data.charging ? (
              <Button onClick={showAddOrderModal}>购买</Button>
            ) : (
              <Button onClick={getFreeInterface}>获取</Button>
            )
          }>
            <Descriptions.Item label="接口状态">{data.status ? '正常' : '关闭'}</Descriptions.Item>
            <Descriptions.Item label="描述">{data.description}</Descriptions.Item>
            {data.charging ? (
                <>
                  <Descriptions.Item label="计费">{data.charging} 元 / 条</Descriptions.Item>
                  <Descriptions.Item label="接口剩余调用次数">
                    {data.availablePieces === null ? '0' : data.availablePieces}次
                  </Descriptions.Item>
                </>
              ) :
              <Descriptions.Item label="接口剩余调用次数">
                {data.availablePieces === null ? '0' : data.availablePieces}次
              </Descriptions.Item>
            }
            <Descriptions.Item label="请求地址">{data.url}</Descriptions.Item>
            <Descriptions.Item label="请求方法">{data.method}</Descriptions.Item>
            <Descriptions.Item label="请求参数">{data.requestParams}</Descriptions.Item>
            <Descriptions.Item label="请求头">{data.requestHeader}</Descriptions.Item>
            <Descriptions.Item label="响应头">{data.responseHeader}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{data.createTime}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{data.updateTime}</Descriptions.Item>
          </Descriptions>
        ) : (
          <>接口不存在</>
        )}
      </Card>
      {/*<Divider/>*/}
      <Card title="在线测试" loading={loading}>
        <Form name="invoke" onFinish={onFinish} layout="vertical">
          <Form.Item label="请求参数" name="userRequestParams" initialValue={data?.parameterExample}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item wrapperCol={{span: 16}}>
            <Button type="primary" htmlType="submit">
              调用
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Card title="调用结果" loading={invokeLoading}>
        {invokeRes}
      </Card>
      {/*<Divider/>*/}

    </PageContainer>
  );
};

export default Index;
