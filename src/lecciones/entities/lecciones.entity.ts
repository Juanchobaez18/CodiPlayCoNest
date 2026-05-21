import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
        @Column()
        orden: string;

}