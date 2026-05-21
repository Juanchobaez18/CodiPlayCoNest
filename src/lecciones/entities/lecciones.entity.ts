import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

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

        @Column({
            type: 'enum',
            enum: ['borrador', 'publicado'],
            default: 'borrador'
        })
        estado: string;

        @CreateDateColumn({ name: 'creado_en' })
        creadoEn: Date;

        @UpdateDateColumn({ name: 'actualizado_en' })
        actualizadoEn: Date;

}