import React, {useState, useEffect} from 'react'
import Card from 'react-credit-cards'
import 'react-credit-cards/es/styles-compiled.css'
import { Button } from 'reactstrap';

import {
    formatCreditCardNumber,
    formatCVC,
    formatExpirationDate
  } from './utils'

const CreditCard = (props) => {
        
    const [state, setState] = useState({
      number: props.card.number !== undefined ? props.card.number : '',
      name: props.card.name !== undefined ? props.card.name : '',
      expiry: props.card.expiry,
      cvc: props.card.cvc !== undefined ? props.card.cvc : '',
      issuer: '',
      focused: '',
      formData: null
    });

    useEffect(() => {
      setState({
        number: props.card.number !== undefined ? props.card.number : '',
        name: props.card.name !== undefined ? props.card.name : '',
        expiry: props.card.expiry,
        cvc: props.card.cvc !== undefined ? props.card.cvc : '',
        issuer: '',
        focused: '',
        formData: null
      })
    }, [props.card])
  
    const handleCallback = ({ issuer }, isValid) => {
      if (isValid) {
        setState({...state, issuer});
      }
    }
  
    const handleInputFocus = ({ target }) => {
        const name = target.name
        setState({...state, focused: name})
    }
  
    const handleInputChange = ({ target }) => {
      if (target.name === 'number') {
        target.value = formatCreditCardNumber(target.value)
      } else if (target.name === 'expiry') {
        target.value = formatExpirationDate(target.value)
      } else if (target.name === 'cvc') {
        target.value = formatCVC(target.value)
      }
  
      setState({
          ...state,
          [target.name]: target.value
      })
    }
  
    const handleSubmit = async e => {
      e.preventDefault()
      props.updateCard(state)
    }
        
      const { name, number, expiry, cvc, focused, issuer } = state;
  
      return (
        <div key='Payment'>
          <div className='App-payment'>
            <Card
              number={number}
              name={name}
              expiry={expiry}
              cvc={cvc}
              focused={focused}
              callback={handleCallback}
            />
            <form onSubmit={handleSubmit}>
              <div className='form-group'>
                <small>Name on card:</small>
  
                <input
                  type='text'
                  name='name'
                  className='form-control'
                  placeholder='Name'
                  pattern='[a-z A-Z-]+'
                  required
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  value={name}
                />
              </div>
              <div className='form-group'>
                <small>Card Number:</small>
  
                <input
                  type='tel'
                  name='number'
                  className='form-control'
                  placeholder='Card Number'
                  pattern='[\d| ]{16,22}'
                  maxLength='19'
                  required
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  value={number}
                />
              </div>
  
              <div className='form-group'>
                <small>Expiration Date:</small>
  
                <input
                  type='tel'
                  name='expiry'
                  className='form-control'
                  placeholder='Valid Thru'
                  pattern='\d\d/\d\d'
                  required
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  value={expiry}
                />
              </div>
              <div className='form-group'>
                <small>CVC:</small>
  
                <input
                  type='tel'
                  name='cvc'
                  className='form-control'
                  placeholder='CVC'
                  pattern='\d{3}'
                  required
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  value={cvc}
                />
              </div>
              <input type='hidden' name='issuer' value={issuer} />
              <div className='form-actions'>
                <Button color="primary">Submit</Button>
              </div>
            </form>
          </div>
        </div>
      )
  }

export default CreditCard;