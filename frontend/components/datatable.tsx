import {
  Table,
  TableCell,
  TableRow,
  TableHeader,
  TableColumn,
  TableBody,
  Link,
} from '@nextui-org/react'
import { FaInstagram } from 'react-icons/fa'
import { VscGraphLine } from 'react-icons/vsc'
import { CgProfile } from 'react-icons/cg'

import { AllDetails } from './alldetails'

import { LifterResult } from '@/api/fetchLifterData/fetchLifterDataTypes'

export const DataTable = ({
  lifters,
  openLifterGraphHandler,
}: {
  lifters: LifterResult[]
  openLifterGraphHandler: (lifterName: string) => void
}) => {
  const generateLifterRow = (lifter: LifterResult, lifterNo: number) => {
    const {
      lifter_name,
      instagram,
      country,
      best_snatch,
      best_cj,
      total,
      sinclair,
    } = lifter
    const lifter_page = 'lifter?name=' + lifter_name

    return (
      <TableRow key={`lifter-${lifterNo}`}>
        <TableCell>{lifterNo}</TableCell>
        <TableCell>{lifter_name}</TableCell>
        <TableCell className="space-x-3 whitespace-nowrap">
          <button onClick={() => openLifterGraphHandler(lifter_name)}>
            <VscGraphLine size={25} />
          </button>
          <Link href={lifter_page}>
            <CgProfile size={25} />
          </Link>
          {instagram && (
            <a
              href={`https://www.instagram.com/${instagram}`}
              className=" inline-block "
            >
              <FaInstagram size={25} />
            </a>
          )}
        </TableCell>
        <TableCell>{country}</TableCell>
        <TableCell>{best_snatch}</TableCell>
        <TableCell>{best_cj}</TableCell>
        <TableCell>{total}</TableCell>
        <TableCell>{sinclair}</TableCell>
        <TableCell>
          <AllDetails full_comp={lifter} />
        </TableCell>
      </TableRow>
    )
  }

  return (
    <Table aria-label="Open weight lifting lifters results table">
      <TableHeader>
        <TableColumn>Rank</TableColumn>
        <TableColumn>Lifter</TableColumn>
        <TableColumn>
          <></>
        </TableColumn>
        <TableColumn>Federation</TableColumn>
        <TableColumn>Top Snatch</TableColumn>
        <TableColumn>Top Clean & Jerk</TableColumn>
        <TableColumn>Total</TableColumn>
        <TableColumn>Sinclair</TableColumn>
        <TableColumn>Details</TableColumn>
      </TableHeader>
      <TableBody>
        {lifters.map((lifter, i) => generateLifterRow(lifter, i + 1))}
      </TableBody>
    </Table>
  )
}
