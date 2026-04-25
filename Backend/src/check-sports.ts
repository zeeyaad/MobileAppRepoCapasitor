import { AppDataSource } from './database/data-source';
import { Sport } from './entities/Sport';

async function checkSports() {
    await AppDataSource.initialize();
    const count = await AppDataSource.getRepository(Sport).count();
    console.log(`TOTAL SPORTS IN DB: ${count}`);
    const active = await AppDataSource.getRepository(Sport).find({ where: { status: 'active', is_active: true } });
    console.log(`ACTIVE SPORTS COUNT: ${active.length}`);
    active.forEach(s => console.log(`- ${s.name_ar} (ID: ${s.id}, status: ${s.status}, is_active: ${s.is_active})`));
    await AppDataSource.destroy();
}

checkSports().catch(console.error);
