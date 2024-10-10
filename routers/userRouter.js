import { Router } from "express";
import { sellFormSchema, signinSchema, signupSchema } from "../types.js";
import nodemailer from "nodemailer";
import emailService from "../emailService.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

dotenv.config();

const userRouter = Router();

userRouter.post("/signup", async (req,res) => {
    
    const { success} = signupSchema.safeParse(req.body);

    if(!success) {
        return res.status(401).json({
            message: "Invalid Inputs"
        })
    }

    const { firstName, lastName, email, password } = req.body;

    try {
        // make a db call inside a try catch block

        // check if a user with the same username already exists
        // if exists, return a message that the user already exists
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(user) {
            return res.status(401).json({
                message: "User already exists"
            });
        }   

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
        // if not, create a new user
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword
            }
        })
        const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET)
        
        return res.json({
            message: "User Created",
            token
        })
    } catch (error) {
        return res.status(500).json({
            message: "Some Error occured while creating your account, please try again later"
        })
    }

})

userRouter.post("/signin", async (req,res) => {
    
    const { success} = signinSchema.safeParse(req.body);
    if(!success) {
        return res.status(401).json({
            message: "Invalid Inputs"
        })
    }

    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!user) {
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET)

        return res.json({
            message: "User Signed In",
            token
        })
    }
    catch(e) {
        return res.status(500).json({
            message: "Some Error occured while signing in, please try again later"
        })
    }
})


const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'Authorization header is required',
        });
    }

    const token = authHeader.split(' ')[1];
    

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
        // @ts-ignore
        req.userId = decoded.id; // @ts-ignore
    
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid token',
        });
    }

    next();
};

userRouter.post('/send-otp', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId
            }
        });

        if (!user || !user.email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Use user.email instead of the undefined email variable
        const otp = await emailService.sendOTP(user.email);
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        
        await prisma.user.update({
            where: {
                id: req.userId
            },
            data: {
                otp,
                otpExpiresAt // Corrected property name from otpExpiry to otpExpiresAt
            }
        });

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send OTP' });
        console.log(error);
    }
});


  userRouter.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    
    // Retrieve the stored OTP for this email
    // Compare it with the OTP sent by the user
    // Check if the OTP has expired
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if(!user.otp) {
        return res.status(400).json({ error: 'OTP is required' });
    }

    if (user.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    if (new Date() > new Date(user.otpExpiry)) {

        const user = await prisma.user.update({
            where: {
                email
            },
            data: {
                otp: null,
                otpExpiry: null,
                verificationStatus: true
            }
        })
      res.json({ message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid or expired OTP' });
    }
  });

userRouter.get("/info", authMiddleware, async (req, res) => {
    
    try {
        console.log(req.userId)
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId
            }
        })

        if(!user) {
            return res.json({
                message: "User not found"
            })
        }
        console.log(user)

        return res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            verificationStatus: user.verificationStatus
        })
    }
    catch(e) {
        return res.status(500).json({
            message: "Some Error occured while fetching user info, please try again later"
        })
    }


})

function capitalizeFirstLetter(string) {
    if (!string) return ''; // Return an empty string if the input is empty
    return string.charAt(0).toUpperCase() + string.slice(1);
}



userRouter.post("add-device", authMiddleware, async(req, res) => {
    

    const { success } = sellFormSchema.safeParse(req.body);
    if(!success) {
        return res.status(401).json({
            message: "Invalid Inputs"
        })
    }

    const { deviceType, brand, model, yearOfPurchase, condition, storageCapacity, defects, serialNumber, images, deliveryMethod, estimatedPrice } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId
            }
        })

        if(!user) {
            return res.json({
                message: "User not found"
            })
        }

        const device = await prisma.device.create({
            data: {
                type: capitalizeFirstLetter(deviceType),
                brand,
                model,
                yearOfPurchase,
                condition,
                storageCapacity,
                defects,
                serialNumber,
                images,
                deliveryMethod: capitalizeFirstLetter(deliveryMethod),
                estimatedPrice,
                userId: req.userId
            }
        })

        return res.json({
            message: "Device added successfully",
            device
        })
    }
    catch(e) {
        return res.status(500).json({
            message: "Some Error occured while adding device, please try again later"
        })
    }
})

userRouter.get("/devices/:status", authMiddleware, async(req, res) => {
    // Get all devices for the user
    // Return the devices
    const { status } = req.params;
    const validStatus = capitalizeFirstLetter(status);
    let status2;
    if(status === "pending") {
        status2 = "Pending"
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId
            }
        })

        if(!user) {
            return res.json({
                message: "User not found"
            })
        }

        const devices = await prisma.device.findMany({
            where: {
                userId: req.userId,
                status: validStatus
            }
        })

        if(validStatus === "Pending") {

            const reviewDevices = await prisma.device.findMany({
                where: {
                    status: "Pending"
                }
            })

            return res.json({
                devices,
                reviewDevices
            })
        }

        return res.json({
            devices
        })
  }
  catch(e) {
        return res.status(500).json({
            message: "Some Error occured while fetching devices, please try again later"
        })
  }
    
});

userRouter.post("/sendEmail", authMiddleware, async(req,res)=>{
    try{
    console.log("Send Email Route");
    console.log([process.env.EMAIL, process.env.PASSWORD]);
    const user = await prisma.user.findUnique({
        where: {
            id: req.userId
        }
        })
    
    if(!user) {
        return res.json({
            message: "User not found"
        })
    }

    const otp = await emailService.sendOTP(user.email);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
        where: {
            id: req.userId
        },
        data: {
            otp,
            otpExpiresAt
        }
    });
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    }) 
    const emailOptions = {
      from: {
        name: process.env.EMAIL,
        address: process.env.EMAIL
      },
      to: process.env.EMAIL,
      subject: "OTP",
      text: `your otp is ${otp}`
    }
    try{
      await transporter.sendMail(emailOptions);
      res.send("Success");
    }
    catch(err){
      console.log(err);
      res.send("Error Sending Email");
    }
    }
    catch(err){
      console.log(err);
      res.send("Error Sending Email");
    }
  
  })

export default userRouter;



