import { Link } from 'react-router-dom'
import LegalPage from '../components/LegalPage.jsx'

export default function Privacy() {
  return (
    <LegalPage title="Privacy" updated="October 2026">
      <h2>What we collect</h2>
      <ul>
        <li><strong>Your account:</strong> your name, email address and password. Passwords are stored only as a one-way hash, so nobody can read them. A phone number is optional.</li>
        <li><strong>Business details:</strong> for business accounts, the business name, type and pickup address.</li>
        <li><strong>Your activity:</strong> the food listings you post and the reservations you make, including the pickup code and whether the food was collected.</li>
        <li><strong>Messages you send us:</strong> the name, email and message from the contact form.</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Only to run the service: signing you in, showing businesses who is coming to collect food (first name and last initial only),
        showing you your reservations, and replying to your messages. We do not sell your information, and we do not show advertising.
      </p>

      <h2>What other people can see</h2>
      <ul>
        <li>Customers can see a business’s name, address and listings.</li>
        <li>Businesses see a customer’s first name and last initial, the portions reserved and the total. They never see the pickup code until you read it out.</li>
      </ul>

      <h2>Cookies and local storage</h2>
      <p>
        The app stores your sign-in session and, if you save food with the heart button, your saved list in your browser’s local storage on
        your own device. We do not use advertising or tracking cookies.
      </p>

      <h2>Your choices</h2>
      <p>
        You can sign out at any time, which ends your session on our side as well. To ask for your account or messages to be corrected or
        deleted, <Link to="/contact">contact us</Link>.
      </p>
    </LegalPage>
  )
}
