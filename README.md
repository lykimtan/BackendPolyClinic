# Backend Hospital Manager

Hệ thống quản lý bệnh viện backend API được xây dựng với Node.js, Express, và MongoDB.

## 🚀 Tính năng

- **Quản lý người dùng**: Đăng ký, đăng nhập, quản lý hồ sơ
- **Phân quyền**: Admin, Bác sĩ, Y tá, Lễ tân, Bệnh nhân
- **Bảo mật**: JWT authentication, password hashing với bcrypt
- **Validation**: Comprehensive input validation
- **Error Handling**: Centralized error handling
- **RESTful API**: Tuân thủ chuẩn REST

## 📋 Yêu cầu hệ thống

- Node.js (v16 trở lên)
- MongoDB (v5 trở lên)
- npm hoặc yarn

## 🛠️ Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd BackendHospitalManager
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment variables

Tạo file `.env` trong thư mục root:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hospitalDB

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Other Configuration
API_VERSION=v1
FRONTEND_URL=http://localhost:3000
```

### 4. Khởi động MongoDB

Đảm bảo MongoDB đang chạy trên máy của bạn:

```bash
# MongoDB Community Edition
mongod

# Hoặc sử dụng MongoDB service
brew services start mongodb-community
```

### 5. Chạy ứng dụng

#### Development mode (với nodemon):

```bash
npm run dev
```

#### Production mode:

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:8000`

## 📚 API Documentation

### Base URL

```
http://localhost:8000/api
```

### Authentication

Sử dụng Bearer token trong header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### 🔐 Authentication

- `POST /api/users/register` - Đăng ký người dùng mới
- `POST /api/users/login` - Đăng nhập

#### 👤 User Management

- `GET /api/users/profile` - Lấy thông tin profile (Protected)
- `PUT /api/users/profile` - Cập nhật profile (Protected)
- `PUT /api/users/change-password` - Đổi mật khẩu (Protected)

#### 👑 Admin Only

- `GET /api/users` - Lấy danh sách tất cả users
- `GET /api/users/:id` - Lấy thông tin user theo ID
- `PUT /api/users/:id` - Cập nhật user theo ID
- `DELETE /api/users/:id` - Xóa user (soft delete)

#### 🏥 Health Check

- `GET /health` - Kiểm tra tình trạng server

## 🧪 Test API

### 1. Đăng ký user mới (Patient)

```bash
curl -X POST http://localhost:8000/api/users/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "email": "patient@example.com",
    "password": "123456",
    "phone": "+84123456789",
    "role": "patient",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "bloodType": "O+"
  }'
```

### 2. Đăng ký Doctor

```bash
curl -X POST http://localhost:8000/api/users/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Trần",
    "lastName": "Thị B",
    "email": "doctor@example.com",
    "password": "123456",
    "phone": "+84987654321",
    "role": "doctor",
    "department": "Cardiology",
    "specialization": "Heart Surgery",
    "licenseNumber": "DOC123456",
    "yearsOfExperience": 10
  }'
```

### 3. Đăng nhập

```bash
curl -X POST http://localhost:8000/api/users/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "patient@example.com",
    "password": "123456"
  }'
```

### 4. Lấy profile (cần token)

```bash
curl -X GET http://localhost:8000/api/users/profile \\
  -H "Authorization: Bearer <your_token_here>"
```

## 🗂️ Cấu trúc thư mục

```
src/
├── app.js              # Main application file
├── config/
│   └── db.js          # Database configuration
├── controllers/
│   └── userController.js # User controller
├── middleware/
│   ├── auth.js        # Authentication middleware
│   ├── error.js       # Error handling middleware
│   └── validation.js  # Validation middleware
├── models/
│   └── User.js        # User model
└── routes/
    └── userRoutes.js  # User routes
```

## 🔒 Phân quyền người dùng

### 1. **Admin**

- Quản lý tất cả users
- Xem, sửa, xóa bất kỳ user nào
- Truy cập tất cả endpoints

### 2. **Doctor**

- Quản lý profile cá nhân
- Có thông tin chuyên môn (specialization, license, etc.)

### 3. **Nurse**

- Quản lý profile cá nhân
- Thuộc department cụ thể

### 4. **Receptionist**

- Quản lý profile cá nhân
- Có employee ID

### 5. **Patient**

- Quản lý profile cá nhân
- Có thông tin y tế (blood type, allergies, medical history)

## 🛡️ Bảo mật

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt với salt rounds = 12
- **Input Validation**: Comprehensive validation cho tất cả inputs
- **CORS**: Configured để bảo vệ cross-origin requests
- **Error Handling**: Không expose sensitive information
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

## 🐛 Troubleshooting

### 1. Port đã được sử dụng

```bash
# Tìm process đang sử dụng port
lsof -i :8000

# Kill process
kill -9 <PID>
```

### 2. MongoDB connection failed

- Kiểm tra MongoDB có đang chạy không
- Verify connection string trong .env
- Kiểm tra firewall settings

### 3. JWT token expired

- Re-login để lấy token mới
- Kiểm tra JWT_EXPIRE setting trong .env

## 🚀 Deployment

### Environment Variables cho Production

```env
NODE_ENV=production
PORT=80
MONGODB_URI=mongodb://your-production-db/hospitalDB
JWT_SECRET=your-super-secure-secret-key
```

### PM2 Deployment

```bash
npm install -g pm2
pm2 start src/app.js --name "hospital-api"
pm2 startup
pm2 save
```

## 📝 Changelog

### Version 1.0.0

- ✅ User authentication & authorization
- ✅ CRUD operations for users
- ✅ Role-based access control
- ✅ Input validation & error handling
- ✅ Security middleware
- ✅ MongoDB integration

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

Nếu bạn gặp vấn đề, hãy tạo issue trong repository hoặc liên hệ team development.
