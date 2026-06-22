import mongoose from "mongoose";

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

export async function ConnectMogo() {
  await mongoose.connect(`${process.env.MONGOOSEURI}`, clientOptions);
  await mongoose.connection.db?.admin().command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}
