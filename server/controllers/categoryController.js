const { Category } = require('../models/AllModels');
const Product = require('../models/Product');

// Get all categories with product counts
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        // Enhance with product counts
        const categoriesWithCounts = await Promise.all(categories.map(async (cat) => {
            const count = await Product.countDocuments({ category: cat.name });
            return { ...cat._doc, count };
        }));

        res.json(categoriesWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create Category
exports.createCategory = async (req, res) => {
    try {
        const { name, icon } = req.body;
        const category = new Category({ name, icon });
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        console.error("Create Category Error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndDelete(id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
