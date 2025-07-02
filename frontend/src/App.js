import './App.css';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomeScreen from './screen/HomeScreen';
import ProductScreen from './screen/ProductScreen';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Badge from 'react-bootstrap/esm/Badge';
import Nav from 'react-bootstrap/Nav';
import { useContext } from 'react';
import { Store } from './Store';
import CartScreen from './screen/CartScreen';
import SignInScreen from './screen/SignInScreen';
import ShippingAddressScreen from './screen/ShippingAddressScreen';
import SignupScreen from './screen/SignupScreen';
import PaymentMethod from './screen/PaymentMethod';
import PlaceorderdScreen from './screen/PlaceorderdScreen';
import OrderScreen from './screen/OrderScreen';
import OrderHistoryScreen from './screen/OrderHistoryScreen';
import ProfileScreen from './screen/ProfileScreen';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };
  return (
    <BrowserRouter>
      <div className="d-flex flex-column site-container">
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Link to="/" className="link">
                <Navbar.Brand>FLY</Navbar.Brand>
              </Link>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto w-100 justify-content-end">
                  <Link to="/cart" className="nav-link">
                    Cart
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg="danger">
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                      <Link className="dropdown-item" to="/profile">
                        UserProfile
                      </Link>
                      <Link className="dropdown-item" to="/orderhistory">
                        OrderHistory
                      </Link>

                      <Link
                        className="dropdown-item"
                        to="/signin"
                        onClick={signoutHandler}
                      >
                        Sign Out
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin">
                      Sign In
                    </Link>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/signin" element={<SignInScreen />} />
              <Route path="/shipping" element={<ShippingAddressScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/payment" element={<PaymentMethod />} />
              <Route path="/placeorder" element={<PlaceorderdScreen />} />
              <Route path="/order/:id" element={<OrderScreen />} />
              <Route path="/orderhistory" element={<OrderHistoryScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
            </Routes>
          </Container>
        </main>
        <footer className="text-center">
          <div>All Right reserved</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
