import { listInterfaceInfoByPageUsingGET } from '@/services/beanapi-backend/interfaceInfoController';
import { PageContainer } from '@ant-design/pro-components';
import { List, message } from 'antd';
import React, { useEffect, useState } from 'react';

/**
 * 主页
 * @constructor
 */
const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<API.InterfaceInfo[]>([]);
  const [total, setTotal] = useState<number>(0);
  const loadData = async (current = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await listInterfaceInfoByPageUsingGET({
        current,
        pageSize,
      });
      setList(res?.data?.records ?? []);
      setTotal(res?.data?.total ?? 0);
    } catch (error: any) {
      message.error('删除失败, ' + error.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    loadData();
  }, []);

  return (
    <PageContainer title="Bean在线接口开放平台">
      <List
        className="my-list"
        loading={loading}
        itemLayout="horizontal"
        dataSource={list}
        renderItem={(item) => (
          <List.Item actions={[<a key={item.id} href={`interface_info/${item.id}`}>查看</a>]}>
            <List.Item.Meta
              title={<a href={`interface_info/${item.id}`}>{item.name}</a>}
              description={item.description}
            />
          </List.Item>
        )}
        pagination={
        {
          showTotal(total) {
            return '总数' + total;
          },
          total,
          pageSize: 10,
          onChange(page, pageSize) {
             loadData(page,pageSize);
           },
         }
        }
      />
    </PageContainer>
  );
};

export default Index;
