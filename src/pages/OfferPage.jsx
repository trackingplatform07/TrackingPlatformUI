import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter } from 'lucide-react';

const seed = [
  { id: 101, name: 'Credit Card Signup', advertiser: 'Axis Media', payout: '$12', status: 'Active', country: 'IN' },
  { id: 102, name: 'Loan Lead Campaign', advertiser: 'FinCorp', payout: '$8', status: 'Paused', country: 'IN' },
  { id: 103, name: 'Gaming Install Offer', advertiser: 'PlayHub', payout: '$3', status: 'Active', country: 'US' },
];

export default function OfferPage(){
  const [query,setQuery]=useState('');
  const rows = useMemo(()=>seed.filter(r=>r.name.toLowerCase().includes(query.toLowerCase()) || r.advertiser.toLowerCase().includes(query.toLowerCase())),[query]);
  return <div className='p-6 space-y-6 bg-slate-50 min-h-screen'>
    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
      <div>
        <h1 className='text-3xl font-bold'>Manage Offers</h1>
        <p className='text-sm text-slate-500'>React UI for your Offer module</p>
      </div>
      <div className='flex gap-2'>
        <Button variant='outline'><Filter className='w-4 h-4 mr-2'/>Options</Button>
        <Button><Plus className='w-4 h-4 mr-2'/>Create Offer</Button>
      </div>
    </div>

    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      {['Total Offers','Active','Paused','Countries'].map((t,i)=><Card key={t} className='rounded-2xl shadow-sm'><CardContent className='p-5'><div className='text-sm text-slate-500'>{t}</div><div className='text-2xl font-bold mt-2'>{[128,96,12,18][i]}</div></CardContent></Card>)}
    </div>

    <Card className='rounded-2xl shadow-sm'>
      <CardContent className='p-5 space-y-4'>
        <div className='relative max-w-md'>
          <Search className='absolute left-3 top-3 w-4 h-4 text-slate-400'/>
          <Input className='pl-9' placeholder='Search offers...' value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b text-left text-slate-500'>
                <th className='py-3'>ID</th><th>Name</th><th>Advertiser</th><th>Payout</th><th>Country</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=><tr key={r.id} className='border-b hover:bg-slate-50'>
                <td className='py-3'>{r.id}</td><td>{r.name}</td><td>{r.advertiser}</td><td>{r.payout}</td><td>{r.country}</td>
                <td><span className={'px-2 py-1 rounded-full text-xs '+(r.status==='Active'?'bg-green-100':'bg-yellow-100')}>{r.status}</span></td>
                <td><Button size='sm' variant='outline'>Edit</Button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
}
