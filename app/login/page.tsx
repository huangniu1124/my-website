'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { logger } from '../utils/logger';
import Image from 'next/image';
import Logo from '../components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      console.log('登录响应:', { status: res.status, data });

      if (!res.ok) {
        console.log('登录失败:', data.error);
        if (data.error === '用户不存在') {
          message.error('该邮箱未注册，请先注册账号');
          return;
        } else if (data.error === '密码错误') {
          message.error('密码错误，请检查后重试');
          return;
        } else {
          message.error(data.error || '登录失败，请稍后重试');
          return;
        }
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      logger.info('用户登录成功', data.user.id);
      message.success('登录成功');
      router.push('/');
    } catch (error) {
      logger.error('登录失败', undefined, { error });
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('登录失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <Logo inline={true} />
      <div className="login-container mx-auto mt-6">
        <Card 
          style={{ 
            width: '350px', 
            maxWidth: '350px',
            margin: '0 auto'
          }}
          bodyStyle={{ 
            padding: '24px', 
            width: '350px', 
            maxWidth: '350px' 
          }}
          bordered={false}
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">欢迎回来</h2>
            <p className="text-gray-500 mt-1">
              或者{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-400">
                注册新账号
              </Link>
            </p>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            style={{ width: '100%' }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="邮箱地址"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                登录
              </Button>
            </Form.Item>

            <div className="text-center">
              <Link href="#" className="text-blue-500 hover:text-blue-400">
                忘记密码？
              </Link>
            </div>
          </Form>

          <div className="mt-6 text-center text-gray-500">
            <p>
              还没有账号？{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-400">
                立即注册
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
} 