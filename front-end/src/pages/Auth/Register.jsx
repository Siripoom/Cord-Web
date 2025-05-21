import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined, PhoneOutlined , MailOutlined} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { register } from "../../services/api"; // Adjust the import path as necessary
import { useNavigate } from "react-router-dom";


const Register = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    console.log("Register Data:", values);
    await register(values);
    message.success("ลงทะเบียนสําเร็จ");
    navigate("/auth/login");
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md p-8 rounded-2xl shadow-lg bg-white">
          <div className="flex flex-col items-center mb-6">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
              alt="ambulance"
              className="w-12 h-12 mb-2"
            />
            <h2 className="text-xl font-bold text-center">ระบบรับส่งผู้ป่วย</h2>
            <p className="text-gray-600 text-center">ลงทะเบียน</p>
          </div>

          <Form
            name="register-form"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: "โปรดป้อนชื่อผู้ใช้" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="ชื่อผู้ใช้งาน" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[{ required: true, message: "โปรดป้อนชื่อผู้ใช้" }]}
            >
              <Input type="email"  prefix={<MailOutlined />} placeholder="อีเมล" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "โปรดป้อนรหัสผ่าน" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="รหัสผ่าน"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "โปรดยืนยันรหัสผ่าน" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("รหัสผ่านไม่ตรงกัน!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="ยืนยันรหัสผ่าน"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "โปรดป้อนเบอร์โทรศัพท์" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "กรุณากรอกเบอร์โทร 10 หลัก",
                },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="เบอร์โทรศัพท์" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                สมัครสมาชิก
              </Button>
            </Form.Item>
            <p className="text-center text-gray-500 text-sm mt-4">
              มีบัญชีแล้ว?{" "}
              <Link to="/auth/login" className="text-blue-600 hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default Register;
