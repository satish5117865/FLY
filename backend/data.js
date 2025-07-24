import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'Satish sharma',
      email: 'satish.phenom@gmail.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: true
    },
    {
      name: 'Shruti',
      email: 'user@example.com',
      password: bcrypt.hashSync('123456789'),
      isAdmin: false
    }
  ],
  products: [
    {
      // _id: '1',
      name: 'Lenovo Desktop',
      slug: 'lenovo',
      category: 'Desktop Computers',
      image: '/images/lenovoDesktop.jpeg',
      price: 15000,
      countInStock: 10,
      brand: 'Lenovo',
      rating: 4.5,
      numReviews: 10,
      description: 'High quality Computers'
    },

    {
      // _id: '2',
      name: 'HP Desktop',
      slug: 'hp',
      category: 'Desktop Computers',
      image: '/images/hp-desktop.jpg',
      price: 16550,
      countInStock: 10,
      brand: 'HP',
      rating: 4.5,
      numReviews: 10,
      description: 'High quality Computers'
    },

    {
      //_id: '3',
      name: 'Dell Desktop',
      slug: 'dell',
      category: 'Desktop Computers',
      image: '/images/dellDesktop.webp',
      price: 18000,
      countInStock: 10,
      brand: 'Dell',
      rating: 4.5,
      numReviews: 10,
      description: 'High quality Computers'
    },

    {
      //_id: '4',
      name: 'Asus Desktop',
      slug: 'asus',
      category: 'Desktop Computers',
      image: '/images/Asus.jpeg',
      price: 14000,
      countInStock: 10,
      brand: 'Asus',
      rating: 4.5,
      numReviews: 10,
      description: 'High quality Computers'
    },
    {
      //_id: '4',
      name: 'Lenovo Laptop',
      slug: 'lp',
      category: 'Laptop Computers',
      image: '/images/lenovoLp.jpeg',
      price: 65000,
      countInStock: 10,
      brand: 'Asus',
      rating: 4.5,
      numReviews: 10,
      description: 'High quality Computers'
    },
    {
      //_id: '4',
      name: 'Dell Laptop',
      slug: 'Dp',
      category: 'Laptop Computers',
      image: '/images/dellLP.avif',
      price: 75000,
      countInStock: 10,
      brand: 'Asus',
      rating: 4.5,
      numReviews: 10,
      description: 'High quality Computers'
    }
  ]
};

export default data;
