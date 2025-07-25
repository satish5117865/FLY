import React, { useContext, useEffect, useReducer } from 'react';
import { getError } from '../utils';
import axios from 'axios';
import { Store } from '../Store';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false
      };
    case 'FETCH_FAIL':
      return { ...state, error: action.payload, loading: false };

    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };

    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };

    default:
      return state;
  }
};

export default function ProductListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, products, pages, loadingCreate }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: ''
    });

  const { search, pathname } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/admin?page=${page}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL' });
      }
    };
    fetchData();
  }, [page, userInfo]);

  const createdHandler = async () => {
    if (window.confirm('Are sure want to create?')) {
      dispatch({ type: 'CREATE_REQUEST' });
      try {
        dispatch({ type: 'CREATE_SUCCESS' });
        const { data } = await axios.post(
          '/api/products',
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.token}` }
          }
        );
        toast.success('Product Created Sucessfully');
        dispatch({ type: 'CREATE_SUCCESS' });
        navigate(`/admin/product/${data.product._id}`);
      } catch (error) {
        toast.error(getError(error));
        dispatch({
          type: 'CREATE_FAIL'
        });
      }
    }
  };
  return (
    <div>
      <Row>
        <Col>
          <h1> Products </h1>
        </Col>
        <Col className="col text-end">
          <div>
            <Button type="button" onClick={createdHandler}>
              Created Product
            </Button>
          </div>
        </Col>
      </Row>

      {loadingCreate && <LoadingBox></LoadingBox>}

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger"> {error}</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Brand</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td> {product._id} </td>
                  <td> {product.name} </td>
                  <td> {product.price} </td>
                  <td> {product.category} </td>
                  <td> {product.brand} </td>
                </tr>
              ))}
            </tbody>
          </table>
          {[...Array(pages).keys()].map((x) => (
            <Link
              className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
              key={x + 1}
              to={`/admin/products?page=${x + 1}`}
            >
              {x + 1}
            </Link>
          ))}
        </>
      )}
    </div>
  );
}
