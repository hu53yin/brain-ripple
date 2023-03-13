import {MongoClient, MongoClientOptions} from 'mongodb'

const MONGODB_URI = String(process.env.MONGODB_BC_URI);
const MONGODB_DB  = String(process.env.MONGODB_BC_DB);

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

if (!MONGODB_DB) {
  throw new Error(
    'Please define the MONGODB_DB environment variable inside .env.local'
  )
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: any = (global as any).mongo

if (!cached) {
  cached = (global as any).mongo = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts: MongoClientOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as MongoClientOptions

    cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      }
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}
