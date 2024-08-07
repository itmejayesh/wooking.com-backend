import express, { Request, Response } from 'express';
import Property from '../models/Property.model';

const router = express.Router();

router.get('/search', async (req: Request, res: Response) => {
    try {
        const pageSize = 5;
        const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1", 10);

        // Validate pageNumber
        if (isNaN(pageNumber) || pageNumber < 1) {
            return res.status(400).json({ message: 'Invalid page number' });
        }

        const properties = await Property.find()
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        const total = await Property.countDocuments()

        const response = {
            data: properties,
            pageination: {
                total,
                pages: Math.ceil(total / pageSize),

            }
        }
        res.status(200).json(response);

    } catch (error) {
        console.error("Error searching property", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
