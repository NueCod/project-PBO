# Mock Data Notes - Manage Internships Page

## Purpose
This file contains mock data for the manage-internships page to demonstrate how the interface should look when internships have been successfully created, since there are currently issues with data not appearing after creation.

## Current Issue
Program magang yang dibuat di halaman create-internship tidak muncul di halaman manage-internships karena masalah konsistensi antara endpoint store dan getCompanyJobs di backend (lihat backend_fix_notes.md).

## Mock Data Structure
The mock data in `app/dashboard/manage-internships/page.tsx` includes:

1. **Active internship with payment**:
   - Title: 'Program Magang Pemasaran Digital'
   - Location: 'Jakarta'
   - Type: 'wfo'
   - Duration: '6' months
   - Paid: true
   - Salary: 'Rp 2.000.000'
   - Applications: 12

2. **Active internship with hybrid work**:
   - Title: 'Magang Developer Frontend'
   - Location: 'Bandung'
   - Type: 'hybrid'
   - Duration: '3' months
   - Paid: true
   - Applications: 8

3. **Closed internship**:
   - Title: 'Magang Desain Grafis'
   - Location: 'Yogyakarta'
   - Type: 'wfh'
   - Duration: '4' months
   - Paid: false
   - Status: Closed

## Implementation Notes
- Mock data is shown when real data API call returns no results
- Added indicator text "*Menampilkan contoh tampilan untuk demonstrasi" to inform users
- Real data will be displayed once the backend issue is resolved

## Required Action
Implement the backend fixes as detailed in `backend_fix_notes.md` to make this mock data obsolete.