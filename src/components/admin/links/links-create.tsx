import { Field, FieldGroup } from "../../ui/field"
import { FieldLabel } from "../../ui/field"
import { FieldError } from "../../ui/field"
import { useRouter } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { Loader, X, Trash2 } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { useCreateLink } from "queries/links/use-create-link"
import { linkFormValidator } from "db/links/link-validator"
import { useRef } from "react"

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

export default function LinksCreate({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter()
	const { mutateAsync: createItemMutation, isPending, error } = useCreateLink()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const form = useForm({
		defaultValues: {
			nombre: "",
			url: "",
			imagen: "",
		},
		validators: {
			onSubmit: linkFormValidator,
		},
		onSubmit: async ({ value }) => {
			const result = await createItemMutation({ data: value })

			if (!result) {
				toast.error("Error al crear el link")
			}
			toast.success("Link creado exitosamente")
			router.navigate({ to: "/admin/links" })
		},
	})

	return (
		<div
			className={cn(
				"w-full sm:w-1/4 mx-auto flex flex-col gap-6 border rounded-lg py-8 px-12 relative bg-accent",
				className
			)}
			{...props}
		>
			<div className="absolute top-4 right-4">
				<Button
					variant="ghost"
					className="cursor-pointer"
					onClick={() => router.navigate({ to: "/admin/links" })}
					aria-label="Cerrar"
				>
					<X size={20} />
				</Button>
			</div>
			<form
				id="create-form"
				onSubmit={e => {
					e.preventDefault()
					form.handleSubmit()
				}}
			>
				<FieldGroup className="gap-5">
					<h2 className="text-2xl font-bold">Crear link</h2>

					<form.Field
						name="nombre"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>nombre</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder=""
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							)
						}}
					/>

					<form.Field
						name="url"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>url</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="https://..."
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							)
						}}
					/>

					<form.Field
						name="imagen"
						children={field => {
							return (
								<Field className="gap-1">
									<FieldLabel htmlFor="imagen-input">Imagen</FieldLabel>
									<input
										id="imagen-input"
										ref={fileInputRef}
										type="file"
										accept="image/*"
										className="hidden"
										onChange={async e => {
											const file = e.target.files?.[0]
											if (file) {
												const base64 = await fileToBase64(file)
												field.handleChange(base64)
											}
										}}
									/>
									<div className="flex gap-2 items-center">
										<Button
											type="button"
											variant="outline"
											onClick={() => fileInputRef.current?.click()}
										>
											Seleccionar imagen
										</Button>
										{field.state.value && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => {
													field.handleChange("")
													if (fileInputRef.current)
														fileInputRef.current.value = ""
												}}
											>
												<Trash2 size={14} />
											</Button>
										)}
									</div>
							{field.state.value && (
									<img
										src={field.state.value}
										alt="Preview"
										className="mt-2 w-20 h-20 object-cover rounded-lg border"
									/>
								)}
								<Textarea
									placeholder="O pegar cadena base64 aquí..."
									value={field.state.value}
									onChange={e => field.handleChange(e.target.value)}
									className="mt-2 text-xs"
									rows={3}
								/>
							</Field>
							)
						}}
					/>

					<Field>
						<Button type="submit" disabled={isPending}>
							{isPending ? (
								<div className="flex gap-2">
									Creando... <Loader className="animate-spin"></Loader>
								</div>
							) : (
								"Crear"
							)}
						</Button>
					</Field>

					{error && <p>{error.message}</p>}
				</FieldGroup>
			</form>
		</div>
	)
}
