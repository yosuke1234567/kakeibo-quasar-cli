import { doc, getDoc } from 'firebase/firestore'
import { OptionCategory } from 'src/components/models'
import { auth, db } from 'src/firebase'

export const getDoughnutValue = async (monthStr: string, categories: OptionCategory[]) => {
    interface Stats {
        amount: number
        category: string
    }
    const statsRef = doc(db, auth.currentUser!.uid, `stats-${monthStr}`)
    const statsData = (await getDoc(statsRef)).data()
    if (statsData) {
        const statsExp: Stats[] = statsData.expense

        let sum = 0
        for (let i = 0; i < statsExp.length; i++) {
            sum += statsExp[i].amount
        }

        if (sum > 0 && auth.currentUser) {

            const chartValue: number[] = []
            for (let i = 0; i < categories.length; i++) {
                chartValue.push(0)
            }
            for (let i = 0; i < categories.length; i++) {
                for (let j = 0; j < statsExp.length; j++) {
                    if (categories[i].type === statsExp[j].category) {
                        chartValue[i] = statsExp[j].amount
                    }
                }
            }
            // console.log(chartValue)
            return chartValue
        } else {
            return []
        }
        
    } else {
        return []
    }
}