import { IonList, IonItem, IonLabel, IonIcon, IonButton } from "@ionic/react";
import { time } from "ionicons/icons";

import { rupiahFormat, shortDate } from "../../hooks/formatting";

interface TransactionItem {
  transaction_code: string;
  time: string;
  date: string;
  total_price: number;
}

interface Props {
  data: TransactionItem[];
  onClickItem: (code: string) => void;
  onReload: () => void;
}

const TransactionList: React.FC<Props> = ({ data, onClickItem, onReload }) => {
  return (
    <>
      {Array.isArray(data) && data.length > 0 ? (
        <IonList>
          {data.map((item) => (
            <IonItem
              key={item.transaction_code}
              onClick={() => onClickItem(item.transaction_code)}
            >
              <IonLabel
                color="medium"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  <IonIcon icon={time} /> {item.time} - {shortDate(item.date)}
                </span>

                <span style={{ color: "darkgreen", fontWeight: "600" }}>
                  {rupiahFormat(item.total_price)}
                </span>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      ) : (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>Tidak ada transaksi saat ini</p>
          <IonButton onClick={onReload}>Ambil Ulang Data</IonButton>
        </div>
      )}
    </>
  );
};

export default TransactionList;
