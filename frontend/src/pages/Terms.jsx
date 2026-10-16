import { Link } from 'react-router-dom'
import LegalPage from '../components/LegalPage.jsx'

export default function Terms() {
  return (
    <LegalPage title="Terms of use" updated="October 2026">
      <h2>What Leftover Lift is</h2>
      <p>
        Leftover Lift connects businesses that have surplus food with people who would like to collect it. We provide the listings and the
        reservation tools. The sale itself is between the business and the customer.
      </p>

      <h2>For customers</h2>
      <ul>
        <li>A reservation holds food for you until the pickup window ends. You pay the business at the counter when you collect.</li>
        <li>Please cancel from My rescues if you cannot make it, so someone else can have the food.</li>
        <li>Check the description and any dietary notes. If you have an allergy, ask the business before you eat.</li>
      </ul>

      <h2>For businesses</h2>
      <ul>
        <li>Only list food that is safe to eat, and describe it honestly, including allergens you know about.</li>
        <li>You are responsible for the food you sell and for following the food safety rules that apply to your business.</li>
        <li>Once a customer has reserved a portion, the price for that reservation cannot change.</li>
      </ul>

      <h2>Everyone</h2>
      <ul>
        <li>Be kind and honest. Accounts that misuse the service can be disabled.</li>
        <li>Keep your sign-in details private, and tell us if you think someone else has used your account.</li>
        <li>The service is provided as it is. We try to keep it running smoothly, but we cannot promise that food will always be available.</li>
      </ul>

      <p>Questions about these terms? <Link to="/contact">Get in touch</Link>.</p>
    </LegalPage>
  )
}
