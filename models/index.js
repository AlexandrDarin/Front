const { Sequelize, DataTypes } = require('sequelize');

// Настройки подключения к БД
const sequelize = new Sequelize(
    process.env.DB_NAME || 'techstore',
    process.env.DB_USER || 'techstore_user',
    process.env.DB_PASSWORD || 'techstore_password',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Модель User
const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING(10),
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'seller', 'admin'),
        defaultValue: 'user'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Модель Product
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.STRING(10),
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    },
    image: {
        type: DataTypes.STRING(500)
    },
    created_by: {
        type: DataTypes.STRING(255),
        references: {
            model: 'users',
            key: 'email'
        }
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Модель RefreshToken
const RefreshToken = sequelize.define('RefreshToken', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.STRING(10),
        references: {
            model: 'users',
            key: 'id'
        }
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'refresh_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Модель CartItem
const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.STRING(10),
        references: {
            model: 'users',
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
        defaultValue: 1,
        validate: {
            min: 1
        }
    }
}, {
    tableName: 'cart_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'product_id']
        }
    ]
});

// Связи между моделями
User.hasMany(RefreshToken, { foreignKey: 'user_id' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CartItem, { foreignKey: 'user_id' });
CartItem.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(CartItem, { foreignKey: 'product_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });

Product.belongsTo(User, { foreignKey: 'created_by', targetKey: 'email' });

module.exports = {
    sequelize,
    User,
    Product,
    RefreshToken,
    CartItem
};