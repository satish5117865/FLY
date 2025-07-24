import React, { useContext, useEffect, useReducer } from 'react';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getError } from '../utils';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/esm/Button';
import { toast } from 'react-toastify';
import { useRazorpay } from 'react-razorpay';
import Form from 'react-bootstrap/Form';
import Razorpay from 'react-razorpay/dist/razorpay';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };
    case 'DETAILS_REQUEST':
      return { ...state, loading: true };
    case 'DETAILS_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'DETAILS_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

export default function OrderScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const params = useParams();
  const { id: orderId } = params;
  const { isPending, Razorpay } = useRazorpay();
  const [responseId, setResponseId] = React.useState('');
  const [responseState, setResponseState] = React.useState([]);
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';
  const [{ loading, error, order, successPay, loadingPay }, dispatch] =
    useReducer(reducer, {
      loading: true,
      order: {},
      error: '',
      successPay: false,
      loadingPay: false
    });

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');

      script.src = src;

      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    loadScript('https:/checkout.razorpay.com/v1/checkout.js');
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` }
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
      }
    };
    if (!userInfo) {
      return navigate('/signin');
    }
    if (!order._id || successPay || (order._id && order._id !== orderId)) {
      fetchOrder();
    }
  }, [order, userInfo, orderId, navigate, successPay, loadingPay]);
  const createRazorpayOrder = async (amount) => {
    try {
      const options = {
        amount: amount,
        currency: 'INR'
      };

      const res = await axios.post(`/api/orders/${order._id}/pay`, options);
      const data = res.data;
      console.log(data);

      const paymentObj = new Razorpay({
        key: 'rzp_test_qGphtJ4ig3h6hV',
        order_id: data.id,
        ...data,
        name: 'FLY',
        // callback_url: '/api/orders/payCapture',
        handler: async function (response) {
          const options2 = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          };

          await axios
            .post(`/api/orders/${order._id}/payCapture`, options2)
            .then((res) => {
              console.log(res.data);
              if (res?.data?.success) {
                setResponseId(response.razorpay_order_id);
                toast.success('Payment Successful');
                window.location.reload();
                // navigate(`/orderhistory`);
              }
            });
        },
        prefill: {
          name: 'Satish Kumar Sharma',
          contact: '9414077059',
          email: 'satish.phenom@gmail.com'
        },
        theme: {
          color: 'green'
        }
      });

      paymentObj.open();
    } catch (error) {
      getError(error);
    }

    // try {
    //   dispatch({ type: 'PAY_REQUEST' });
    //   const { data } = await axios.put(
    //     `/api/orders/${order._id}/pay`,

    //     {
    //       headers: { authorization: `Bearer ${userInfo.token}` }
    //     }
    //   );
    //   dispatch({ type: 'PAY_SUCCESS', payload: data });
    //   toast.success('Order is paid');
    // } catch (err) {
    //   dispatch({ type: 'PAY_FAIL', payload: getError(err) });
    //   toast.error(getError(err));
    // }
  };
  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger"> {error} </MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order</title>
      </Helmet>
      <h3 className="my-3"> Order {orderId} </h3>
      {order.isPaid ? (
        <div className="mb-3">
          <h3>Your Order is Placed </h3>
          <Link to={`${redirect}`}> Click here to Go to another Shoping</Link>
        </div>
      ) : (
        <MessageBox variant="light">
          Redirect to home page after payment
        </MessageBox>
      )}
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                <strong>Address:</strong> {order.shippingAddress.address}, {''}
                {order.shippingAddress.city}, {''}
                {order.shippingAddress.pinCode}, {''}
                {order.shippingAddress.stateName},{' '}
                {order.shippingAddress.country}
              </Card.Text>
              {order.isDelivered ? (
                <MessageBox variant="success">
                  Deliverd at {order.deliverAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Deliverd</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              {order.isPaid ? (
                <MessageBox variant="success">
                  Paid at: {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Paid</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment Information</Card.Title>
              {order.isPaid ? (
                <MessageBox variant="success">
                  Razorpay Payment Id: {order.razorpay_payment_id}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Available</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>
                        {''}
                        <Link to={`/product/${item.slug}`}> {item.name} </Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity} </span>
                      </Col>
                      <Col md={3}>Rs. {item.price} </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup>
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col> Rs. {order.itemsPrice.toFixed(2)} </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col> Rs. {order.shippingPrice.toFixed(2)} </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col> Rs. {order.taxPrice.toFixed(2)} </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Total Price</Col>
                    <Col>
                      <strong> Rs. {order.totalPrice.toFixed(2)} </strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            {!order.isPaid && (
              <ListGroup.Item>
                {isPending ? (
                  <LoadingBox />
                ) : (
                  <div className="d-grid">
                    <Button
                      variant="primary"
                      onClick={() => createRazorpayOrder(order.totalPrice)}
                    >
                      Pay
                    </Button>
                  </div>
                )}
                {loadingPay && <LoadingBox></LoadingBox>}
              </ListGroup.Item>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
