import {
  Table,
  TableHeader,
  TableColumn,
  TableCell,
  TableRow,
  TableBody,
} from '@nextui-org/react'
import { LifterHistory } from '@/api/fetchLifterHistory/fetchLifterHistoryTypes'

export const HistoryTable = ({
  history,
}: {
  history: LifterHistory['lifts']
}) => {
  return (
    <Table>
      <TableHeader>
        <TableColumn>Date</TableColumn>
        <TableColumn>Event</TableColumn>
        <TableColumn>Bodyweight</TableColumn>
        <TableColumn>1st Snatch</TableColumn>
        <TableColumn>2nd Snatch</TableColumn>
        <TableColumn>3rd Snatch</TableColumn>
        <TableColumn>1st C&J</TableColumn>
        <TableColumn>2nd C&J</TableColumn>
        <TableColumn>3rd C&J</TableColumn>
        <TableColumn>Total</TableColumn>
        <TableColumn>Sinclair</TableColumn>
      </TableHeader>
      <TableBody>
        {history.map((lift, index) => {
          const {
            date,
            event,
            bodyweight,
            snatch_1,
            snatch_2,
            snatch_3,
            cj_1,
            cj_2,
            cj_3,
            total,
            sinclair,
          } = lift

          return (
            <TableRow key={`history-${index}`}>
              <TableCell>{date}</TableCell>
              <TableCell>{event}</TableCell>
              <TableCell>{bodyweight}</TableCell>
              <TableCell>{snatch_1}</TableCell>
              <TableCell>{snatch_2}</TableCell>
              <TableCell>{snatch_3}</TableCell>
              <TableCell>{cj_1}</TableCell>
              <TableCell>{cj_2}</TableCell>
              <TableCell>{cj_3}</TableCell>
              <TableCell>{total}</TableCell>
              <TableCell>{sinclair}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
