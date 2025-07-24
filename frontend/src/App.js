import './App.css';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate
} from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
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
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useEffect } from 'react';
import { getError } from './utils';
import axios from 'axios';
import SearchBox from './components/SearchBox';
import SearchScreen from './screen/SearchScreen';
import ProtectedRoutes from './components/ProtectedRoutes';
import DashboardScreen from './screen/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screen/ProductListScreen';

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
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);
  return (
    <BrowserRouter>
      <div
        className={
          sidebarIsOpen
            ? 'd-flex flex-column site-container active-cont'
            : 'd-flex flex-column site-container'
        }
      >
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Button
                variant="dark"
                onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
              >
                <i className="fas fa-bars"></i>
              </Button>
              <Link to="/" className="link">
                <Navbar.Brand>FLY</Navbar.Brand>
              </Link>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <SearchBox />
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
                  {userInfo && userInfo.isAdmin && (
                    <NavDropdown title="Admin" id="admin-nav-dropdown">
                      <div className="type1">
                        <Link to="/admin/dashboard" className="type2">
                          Dashboard
                        </Link>
                        <Link to="/admin/products" className="type2">
                          Products{' '}
                        </Link>
                        <Link to="/admin/orders" className="type2">
                          Orders
                        </Link>
                        <Link to="/admin/users" className="type2">
                          Users
                        </Link>
                      </div>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        <div
          className={
            sidebarIsOpen
              ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
              : 'side-navbar d-flex justify-content-between flex-wrap flex-column'
          }
        >
          <Nav className="flex-column text-white w-100 p-2">
            <Nav.Item>
              <strong>Categories</strong>
            </Nav.Item>
            {categories.map((category) => (
              <Nav.Item key={category} className="max">
                <Link
                  to={{ pathname: '/search', search: `category=${category}` }}
                  onClick={() => setSidebarIsOpen(false)}
                  className="type"
                >
                  <Nav>{category}</Nav>
                </Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>
        <main>
          <Container className="mt-3">
            <Routes>
              {/* Admin Routes*/}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <ProductListScreen />
                  </AdminRoute>
                }
              />

              <Route path="/" element={<HomeScreen />} />
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/signin" element={<SignInScreen />} />
              <Route path="/shipping" element={<ShippingAddressScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/payment" element={<PaymentMethod />} />
              <Route path="/placeorder" element={<PlaceorderdScreen />} />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoutes>
                    <OrderScreen />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="/orderhistory"
                element={
                  <ProtectedRoutes>
                    {' '}
                    <OrderHistoryScreen />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoutes>
                    <ProfileScreen />{' '}
                  </ProtectedRoutes>
                }
              />
              <Route path="/search" element={<SearchScreen />} />
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
