import { UserModel } from "./userauthmodel.ts";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { SignToken } from "./utils/GenerateToken.ts";
import { RedisCli } from "./config/redis.ts";
import { db, client } from "./config/mongoconfig.ts";
import { ObjectId } from "mongodb";

export async function LoginWithGoogle({
  email,
  name,
  picture,
  sub,
}: {
  email: string;
  name: string;
  picture: string;
  sub: string;
}) {
  try {
    const finduser = await UserModel.findOne({ Email: email });

    if (finduser == null)
      return { status: true, message: "user not found", token: undefined };

    if (finduser.picture == "" || finduser.sub == "") {
      finduser.picture = await picture;
      finduser.sub = await sub;
      await finduser.save();
    }

    let sessionId = await uuidv4();

    const token = await SignToken({
      userId: String(finduser._id),
      sessionId: sessionId,
    });

    if (token.Signaccess == undefined || token.Signrefresh == undefined)
      return {
        status: true,
        message: "please login to access",
        token: undefined,
      };

    await RedisCli.set(
      `${await token.Signrefresh}`,
      `${finduser._id}`,
      "EX",
      604800,
    );

    await RedisCli.set(
      `${await token.Signaccess}`,
      `${finduser._id}`,
      "EX",
      900,
    );

    return {
      status: true,
      message: "user loggedin",
      token: token,
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: "error",
      token: undefined,
    };
  }
}

export async function SignUpWithGoogle({
  email,
  name,
  picture,
  sub,
}: {
  email: string;
  name: string;
  picture: string;
  sub: string;
}) {
  try {
    const isExist = await UserModel.findOne({ Email: email });

    if (isExist != null)
      return {
        status: false,
        message: "user exist already",
        register: false,
        token: undefined,
      };

    const Register = await UserModel.create({
      Email: email,
      Username: name,
      sub: sub,
      picture: picture,
    });
    await Register.save();

    let sessionId = await uuidv4();

    const token = await SignToken({
      userId: String(Register._id),
      sessionId: sessionId,
    });

    if (token.Signaccess == undefined || token.Signrefresh == undefined)
      return {
        status: true,
        message: "please login to access",
        register: true,
        token: undefined,
      };

    await RedisCli.set(
      `${await token.Signrefresh}`,
      `${Register._id}`,
      "EX",
      604800,
    );

    await RedisCli.set(
      `${await token.Signaccess}`,
      `${Register._id}`,
      "EX",
      900,
    );

    return {
      status: true,
      message: "user register",
      register: true,
      token: token,
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: "error",
      register: false,
      token: undefined,
    };
  }
}

export async function RegisterUser({
  email,
  username,
  password,
}: {
  email: string;
  username: string;
  password: string;
}) {
  try {
    const isExist = await UserModel.findOne({ Email: email });

    if (isExist != null)
      return {
        status: false,
        message: "user exist already",
        register: false,
        token: undefined,
      };

    const hashed = await bcrypt.hash(password, 10);
    const Register = await UserModel.create({
      Email: email,
      Username: username,
      Password: hashed,
    });
    await Register.save();

    let sessionId = await uuidv4();

    const token = await SignToken({
      userId: String(Register._id),
      sessionId: sessionId,
    });

    if (token.Signaccess == undefined || token.Signrefresh == undefined)
      return {
        status: true,
        message: "please login to access",
        register: true,
        token: undefined,
      };

    await RedisCli.set(
      `${await token.Signrefresh}`,
      `${Register._id}`,
      "EX",
      604800,
    );

    await RedisCli.set(
      `${await token.Signaccess}`,
      `${Register._id}`,
      "EX",
      900,
    );

    return {
      status: true,
      message: "user register",
      register: true,
      token: token,
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: "error",
      register: false,
      token: undefined,
    };
  }
}

export async function DeleteAccount({ userId }: { userId: string }) {
  const urlcolletion = await db.collection("urlmodels");
  const urlanalyticcollection = await db.collection("linkanalyticsmodels");
  const usercollection = await db.collection("usermodels");

  const session = client.startSession();
  try {
    session.startTransaction();

    await usercollection.deleteOne(
      { _id: new ObjectId(userId) },
      { session: session },
    );

    await urlcolletion.deleteMany(
      { UserId: new ObjectId(userId) },
      { session: session },
    );

    await urlanalyticcollection.deleteMany(
      { userId: new ObjectId(userId) },
      { session: session },
    );

    session.commitTransaction();
    session.endSession();

    return { status: true, mess: "Account Deleted" };
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    await session.endSession();
    return { status: false, mess: "transaction error" };
  }
}

export async function LoginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const finduser = await UserModel.findOne({ Email: email });

    if (finduser == null)
      return { status: true, message: "user not found", token: undefined };

    const compare = await bcrypt.compare(password, finduser.Password);

    if (!compare)
      return { status: true, message: "incorrect password", token: undefined };

    let sessionId = await uuidv4();

    const token = await SignToken({
      userId: String(finduser._id),
      sessionId: sessionId,
    });

    if (token.Signaccess == undefined || token.Signrefresh == undefined)
      return {
        status: true,
        message: "please login to access",
        token: undefined,
      };

    await RedisCli.set(
      `${await token.Signrefresh}`,
      `${finduser._id}`,
      "EX",
      604800,
    );

    await RedisCli.set(
      `${await token.Signaccess}`,
      `${finduser._id}`,
      "EX",
      900,
    );

    return {
      status: true,
      message: "user loggedin",
      token: token,
    };
  } catch (error) {
    console.error(error);
    return { status: false, message: "please try again", token: undefined };
  }
}

export async function updatePassword({
  newPassword,
  _id,
  email,
}: {
  newPassword: string;
  _id: string;
  email: string;
}) {
  try {
    let newHashedPass = await bcrypt.hash(newPassword, 10);

    if (email == "") {
      const Update = await UserModel.updateOne(
        { _id: _id },
        { $set: { Password: newHashedPass } },
      );

      if (Update.acknowledged == false)
        return { status: false, message: "please try again" };

      if (Update.matchedCount == 0)
        return { status: false, message: "user not found" };

      if (Update.modifiedCount == 1 && Update.matchedCount == 1)
        return { status: true, message: "updated" };
    }

    const Update = await UserModel.updateOne(
      { Email: email },
      { $set: { Password: newHashedPass } },
    );

    if (Update.acknowledged == false)
      return { status: false, message: "please try again" };

    if (Update.matchedCount == 0)
      return { status: false, message: "user not found" };

    if (Update.modifiedCount == 1 && Update.matchedCount == 1)
      return { status: true, message: "updated" };

    return { status: false, message: "please try again" };
  } catch (error) {
    console.error(error);
    return { status: false, message: "please try again" };
  }
}
