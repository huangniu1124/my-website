'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { logger } from '../utils/logger';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; email: string; password: string }) => {
    setLoading(true);

    try {
      // 注册
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.error || '注册失败');
      }

      // 自动登录
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.error || '登录失败');
      }

      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      logger.info('用户注册并登录成功', loginData.user.id);
      message.success('注册成功');
      router.push('/');
    } catch (error) {
      logger.error('注册失败', undefined, { error });
      message.error(error instanceof Error ? error.message : '注册失败');
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
            <h2 className="text-xl font-semibold text-gray-800">创建新账号</h2>
            <p className="text-gray-500 mt-1">
              或者{' '}
              <Link href="/login" className="text-blue-500 hover:text-blue-400">
                登录已有账号
              </Link>
            </p>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            style={{ width: '100%' }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="用户名"
              />
            </Form.Item>

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
                注册
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-6 text-center text-gray-500">
            <p>
              已有账号？{' '}
              <Link href="/login" className="text-blue-500 hover:text-blue-400">
                立即登录
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
} 