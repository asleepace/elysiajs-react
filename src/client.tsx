
import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import HomePage from './test/HomePage'

const props = window.__INITIAL_PROPS__ || {}

hydrateRoot(document, <HomePage {...props} />)