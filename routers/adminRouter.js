import { Router } from "express";
import { adjustPriceSchema, sellFormSchema, signinSchema, signupSchema } from "../types.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

dotenv.config();

const adminRouter = Router();

adminRouter.post("/signin", async (req,res) => {
    
    const { success} = signinSchema.safeParse(req.body);
    if(!success) {
        return res.status(401).json({
            message: "Invalid Inputs"
        })
    }

    const { email, password } = req.body;

    try {
        const admin = await prisma.admin.findUnique({
            where: {
                email
            }
        })

        if(!admin) {
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if(!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }

        const token = jwt.sign({id: admin.id}, process.env.JWT_SECRET)

        return res.json({
            message: "admin Signed In",
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
        req.adminId = decoded.id; // @ts-ignore
    
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid token',
        });
    }

    next();
};

adminRouter.get("/info", authMiddleware, async (req, res) => {
    
    try {
        console.log(req.adminId)
        const admin = await prisma.admin.findUnique({
            where: {
                id: req.adminId
            }
        })

        if(!admin) {
            return res.json({
                message: "admin not found"
            })
        }
        console.log(admin)

        return res.json({
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email
        })
    }
    catch(e) {
        return res.status(500).json({
            message: "Some Error occured while fetching admin info, please try again later"
        })
    }


})

function capitalizeFirstLetter(string) {
    if (!string) return ''; // Return an empty string if the input is empty
    return string.charAt(0).toUpperCase() + string.slice(1);
}

adminRouter.get("/devices", authMiddleware, async (req, res) => {

    try {

        const admin = await prisma.admin.findUnique({
            where: {
                id: req.adminId
            }
        })

        if(!admin) {
            return res.json({
                message: "admin not found"
            })
        }


        const devices = await prisma.device.findMany();

        return res.json({
            devices
        })

    }
    catch(e) {
        return res.status(500).json({
            message: "Some Error occured while fetching devices, please try again later"
        })
    }
})

adminRouter.post("/adjust-price", authMiddleware, async (req, res) => {

    const { deviceId, newPrice } = req.body;
    const { success } = adjustPriceSchema.safeParse(req.body);
    if(!success) {
        return res.status(401).json({
            message: "Invalid Inputs"
        })
    }

    try {
        const device = await prisma.device.findUnique({
            where: {
                id: deviceId
            }
        })

        if(!device) {
            return res.json({
                message: "Device not found"
            })
        }

        await prisma.device.update({
            where: {
                id: deviceId
            },
            data: {
                adjustedPrice: newPrice
            }
        })

        return res.json({
            message: "Price adjusted successfully"
        })

    }
    catch(e) {
        return res.status(500).json({
            message: "Some Error occured while adjusting price, please try again later"
        })
    }
})

adminRouter.post("/update-device-status", authMiddleware, async (req, res) => {

    const validStatus = capitalizeFirstLetter(status);
    
    try {
        const admin = prisma.admin.findUnique({
            where: {
                id: req.adminId
            }
        })


        const { deviceId, status  } = req.body;
        const validStatus = capitalizeFirstLetter(status);

        const device = await prisma.device.update({
            where: {
                id: deviceId
            },
            data: {
                status: validStatus
            }
        });

        return res.json({
            message: "Device status updated successfully"
        })
    }
    catch(e) {
        return res.status(500).json({
            message: "Some Error occured while updating device, please try again later"
        })
    }
});

adminRouter.get("/trends", authMiddleware, async (req, res) => {
    // return no. of devices in terms of type: new, used, damaged
    try {
        const newDevices = await prisma.device.count({
            where: {
                status: "New"
            }
        })
    
        const usedDevices = await prisma.device.count({
            where: {
                status: "Used"
            }
        })
    
        const damagedDevices = await prisma.device.count({
            where: {
                status: "Damaged"
            }
        })
    
        return res.json({
            newDevices,
            usedDevices,
            damagedDevices
        })
    }
    catch(e) {
        return res.status(500).json({
            message: "Some Error occured while fetching trends, please try again later"
        })
    }

})

adminRouter.get("/device/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const device = await prisma.device.findUnique({
            where: {
                id
            }
        })

        if(!device) {
            return res.json({
                message: "Device not found"
            })
        }

        return res.json({
            device
        })
    }
    catch(e) {
        return res.status(500).json({
            message: "Some Error occured while fetching device, please try again later"
        })
    }
})

adminRouter.get("/devices-sold", authMiddleware, async (req, res) => {
    try {

        // devices sold in the last month:
        const devicesSold = await prisma.device.count({
            where: {
                status: "Sold"
            }
        })

        return res.json({
            devicesSold
        })
    }
    catch(e) {
        return res.status(500).json({
            message: "Some Error occured while fetching devices, please try again later"
        })
    }
})

export default adminRouter;