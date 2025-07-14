import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  // Các tùy chọn kết nối MongoDB mới nhất
  connectTimeoutMS: 30000, // Tăng thời gian timeout kết nối
  socketTimeoutMS: 45000, // Tăng thời gian timeout socket
  maxPoolSize: 50, // Tăng kích thước pool kết nối
  minPoolSize: 10, // Đặt kích thước pool tối thiểu
  retryWrites: true, // Cho phép thử lại các thao tác ghi
  retryReads: true, // Cho phép thử lại các thao tác đọc
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Khai báo kiểu cho biến toàn cục
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === "development") {
  // Trong môi trường phát triển, sử dụng biến toàn cục để giữ giá trị
  // qua các lần tải lại module do HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
      .then(client => {
        console.log('MongoDB connected successfully in development mode');
        return client;
      })
      .catch(err => {
        console.error('Failed to connect to MongoDB in development mode:', err);
        throw err;
      })
  }
  clientPromise = global._mongoClientPromise
} else {
  // Trong môi trường sản xuất, tốt nhất không sử dụng biến toàn cục.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
    .then(client => {
      console.log('MongoDB connected successfully in production mode');
      return client;
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB in production mode:', err);
      throw err;
    })
}

// Export một promise MongoClient phạm vi module. Bằng cách này,
// client có thể được chia sẻ giữa các hàm.
export default clientPromise

// Hàm trợ giúp để lấy instance cơ sở dữ liệu
export async function getMongoDb(dbName?: string) {
  try {
    const client = await clientPromise;
    // Sử dụng tên cơ sở dữ liệu được chỉ định hoặc mặc định là 'trading'
    return client.db(dbName || 'trading');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}
