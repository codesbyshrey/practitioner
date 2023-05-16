// FIX
import crypto from 'crypto'

export function checkToken(userSupplied) {
     // abc vs ae
     // brute force strings, determine time difference between
     // seeing how many closer tokens you're achieving

     const account = account.retrieveToken(userSupplied)
     if (account) {
          // new library --> won't give away timing reveals on similar inputs
          if (crypto.timingSafeEqual(account.service.token === userSupplied.service.token)) {
               return true
          }
     }
     return false;
}

// user supplied info specifies account
// check if theres a service token matching user supplied input

// vulnerable due to smth called a timing attack
// string === will compare throughout each iterated character