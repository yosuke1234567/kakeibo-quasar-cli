import { query, collection, getDocs, where } from "firebase/firestore"
import { SingleExpenseDoc } from "src/components/models"
import { auth, db } from 'src/firebase'

export const getMonthlyData = async (monthArg: number) => {
    const colRef = collection(db, auth.currentUser!.uid)
    const docs: SingleExpenseDoc[] = []
    const q = query(colRef, where('expenseMonthIndex', '==', monthArg))
    const snap = await getDocs(q)
    snap.forEach(doc => docs.push(doc.data() as SingleExpenseDoc))

    docs.sort((first, second) => {
        if (first.date > second.date) {
            return 1;
        } else if (first.date < second.date) {
            return -1;
        } else {
            return 0;
        }
    })

    // console.log(docs)

    return docs
}