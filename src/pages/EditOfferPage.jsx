import { useParams } from "react-router-dom";
import CreateOfferPage from "./CreateOfferPage";

// Reusing CreateOfferPage keeps every tab, field, and layout identical in edit mode.
export default function EditOfferPage() {
  const { id } = useParams();

  return <CreateOfferPage editOfferId={id} />;
}
