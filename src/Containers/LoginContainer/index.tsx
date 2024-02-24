import axios from 'axios'
import * as React from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { Form, Icon, Spin, Input, Button, notification, Col, Row } from 'antd'

/** Presentational */
import FormWrapper from '../../Components/Styled/FormWrapper'

/** App theme */
import { colors } from '../../Themes/Colors'

/** App constants */
import { AUTH_USER_TOKEN_KEY } from '../../Utils/constants'

const baseUrl = 'https://t5n7j723yd.execute-api.us-east-1.amazonaws.com'

type Props = RouteComponentProps & {
  form: any
}

type State = {
  loading: boolean
}

class LoginContainer extends React.Component<Props, State> {
  state = {
    loading: false,
  }

  handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    let name: string = ''

    this.props.form.validateFields(
      (err: Error, values: { username: string; password: string }) => {
        if (!err) {
          const { username, password } = values

          this.setState({ loading: true })

          axios
            .post(`${baseUrl}/login`, {
              username: username,
              password: password,
            })
            .then((response) => {
              const tokenStr =
                response.data.success.AuthenticationResult.AccessToken
              axios
                .get(`${baseUrl}/get`, {
                  headers: { Authorization: `Bearer ${tokenStr}` },
                })
                .then((result) => {
                  for (let attribute of result.data.userAttributes) {
                    if (attribute.Name === 'name') {
                      name = attribute.Value
                    }
                  }

                  sessionStorage.setItem('fullName', name)

                  localStorage.setItem(AUTH_USER_TOKEN_KEY, tokenStr)
                  // console.log('TOKEN: ', response.data.success)
                  notification.success({
                    message: 'Succesfully logged in!',
                    description:
                      'Logged in successfully, Redirecting you in a few!',
                    placement: 'topRight',
                    duration: 1.5,
                  })
                })

              this.props.history.push('/dashboard')
            })
            .catch((err) => {
              notification.error({
                message: 'Error',
                description: err.message,
                placement: 'topRight',
              })

              console.log(err)

              this.setState({ loading: false })
            })
        }
      }
    )
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { loading } = this.state

    return (
      <React.Fragment>
        <FormWrapper onSubmit={this.handleSubmit} className="login-form">
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [
                {
                  required: true,
                  message: 'Please input your username here!',
                },
              ],
            })(
              <Input
                prefix={
                  <Icon
                    type="user"
                    style={{ color: colors.transparentBlack }}
                  />
                }
                placeholder="Username"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: 'Please input your password!',
                },
              ],
            })(
              <Input
                prefix={
                  <Icon
                    type="lock"
                    style={{ color: colors.transparentBlack }}
                  />
                }
                type="password"
                placeholder="Password"
              />
            )}
          </Form.Item>
          <Form.Item className="text-center">
            <Row type="flex" gutter={16}>
              <Col lg={24}>
                <Link
                  style={{ float: 'right' }}
                  className="login-form-forgot"
                  to="/forgot-password"
                >
                  Forgot password
                </Link>
              </Col>
              <Col lg={24}>
                <Button
                  style={{ width: '100%' }}
                  type="primary"
                  disabled={loading}
                  htmlType="submit"
                  className="login-form-button"
                >
                  {loading ? (
                    <Spin
                      indicator={
                        <Icon type="loading" style={{ fontSize: 24 }} spin />
                      }
                    />
                  ) : (
                    'Log in'
                  )}
                </Button>
              </Col>
              <Col lg={24}>
                Or <Link to="/signup">register now!</Link>
              </Col>
            </Row>
          </Form.Item>
        </FormWrapper>
      </React.Fragment>
    )
  }
}

export default Form.create()(LoginContainer)
