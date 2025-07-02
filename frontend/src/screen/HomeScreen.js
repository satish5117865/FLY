import React, { useEffect, useReducer, useState } from 'react';
//import data from '../data';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logger from 'use-reducer-logger';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH REQUEST':
      return { ...state, loading: true };

    case 'FETCH SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function HomeScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(logger(reducer), {
    products: [],
    loading: true,
    error: ''
  });
  //const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH SUCCESS', payload: result.data });
      } catch (error) {
        dispatch({ type: 'FETCH FAIL', payload: error.message });
      }

      //setProducts(result.data);
    };
    fetchData();
  }, []);
  return (
    <div>
      <Helmet>
        <title>FLY</title>
      </Helmet>
      <h1>Featured Product</h1>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
