const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.STRING(10),
        primaryKey: true
    },
    user_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    payment_id: {
        type: DataTypes.STRING(100)
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.STRING(10),
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.STRING(10),
        references: {
            model: 'products',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    price_at_time: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_title: {
        type: DataTypes.STRING(255)
    },
    product_image: {
        type: DataTypes.STRING(500)
    }
}, {
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Связи
Order.belongsTo(require('./index').User, { foreignKey: 'user_id' });
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(require('./index').Product, { foreignKey: 'product_id' });

module.exports = { Order, OrderItem };