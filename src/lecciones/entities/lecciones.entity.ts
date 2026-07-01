import { Modulos } from "src/modulos/entities/modulos.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Lecciones {
    @PrimaryGeneratedColumn()
        id: number;

        @Column()
        titulo: string;
        @Column()
        descripcion: string;
        @Column()
        contenido: string;
        @Column({ type: 'int' })
        orden: number;

@ManyToOne(() => Modulos, modulos => modulos.lecciones)
modulo: Modulos;
}